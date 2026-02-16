/**
 * JMAP Client
 * Request builder with support for batch requests and back-references
 */

import type {
  JMAPRequest,
  JMAPResponse,
  JMAPSession,
  MethodCall,
  MethodResponse,
  ResultReference,
} from './types'

/**
 * Generate a unique call ID
 */
let callIdCounter = 0
export function generateCallId(prefix = 'call'): string {
  return `${prefix}-${callIdCounter++}`
}

/**
 * Reset call ID counter (useful for testing)
 */
export function resetCallIdCounter(): void {
  callIdCounter = 0
}

/**
 * JMAP Request Builder
 * Helps construct JMAP requests with multiple method calls
 */
export class JMAPRequestBuilder {
  private using: Set<string> = new Set()
  private methodCalls: Array<MethodCall> = []
  private callIds: Map<string, number> = new Map()

  constructor() {
    // Always include core capability
    this.using.add('urn:ietf:params:jmap:core')
  }

  /**
   * Add a capability to the using array
   */
  addCapability(capability: string): this {
    this.using.add(capability)
    return this
  }

  /**
   * Add multiple capabilities
   */
  addCapabilities(capabilities: Array<string>): this {
    capabilities.forEach((cap) => this.using.add(cap))
    return this
  }

  /**
   * Add a method call to the request
   * Returns the call ID for back-references
   */
  call(
    methodName: string,
    args: Record<string, unknown>,
    callId?: string,
  ): string {
    const id = callId ?? generateCallId()
    this.methodCalls.push([methodName, args, id])
    this.callIds.set(id, this.methodCalls.length - 1)
    return id
  }

  /**
   * Create a back-reference to a previous call's result
   */
  ref(callId: string, path: string): ResultReference {
    const index = this.callIds.get(callId)
    if (index === undefined) {
      throw new Error(`Unknown call ID: ${callId}`)
    }

    const methodName = this.methodCalls[index]![0]

    return {
      resultOf: callId,
      name: methodName,
      path,
    }
  }

  /**
   * Build the JMAP request
   */
  build(): JMAPRequest {
    return {
      using: Array.from(this.using),
      methodCalls: this.methodCalls,
    }
  }

  /**
   * Get the number of method calls
   */
  get length(): number {
    return this.methodCalls.length
  }
}

/**
 * Response parser for JMAP responses
 */
export class JMAPResponseParser {
  private responses: Map<string, MethodResponse> = new Map()

  constructor(response: JMAPResponse) {
    for (const methodResponse of response.methodResponses) {
      const [, , callId] = methodResponse
      this.responses.set(callId, methodResponse)
    }
  }

  /**
   * Get the response for a specific call ID
   */
  get<T = Record<string, unknown>>(callId: string): T {
    const response = this.responses.get(callId)
    if (!response) {
      throw new Error(`No response for call ID: ${callId}`)
    }

    const [methodName, result] = response

    // Check if it's an error response
    if (methodName === 'error') {
      const error = result as { type: string; description?: string }
      throw new JMAPClientError(error.type, error.description)
    }

    return result as T
  }

  /**
   * Check if a call resulted in an error
   */
  isError(callId: string): boolean {
    const response = this.responses.get(callId)
    if (!response) return false
    return response[0] === 'error'
  }

  /**
   * Get all responses
   */
  getAll(): Array<MethodResponse> {
    return Array.from(this.responses.values())
  }
}

/**
 * JMAP Client Error
 */
export class JMAPClientError extends Error {
  constructor(
    public type: string,
    public description?: string,
  ) {
    super(description ?? type)
    this.name = 'JMAPClientError'
  }
}

/**
 * HTTP client for JMAP requests
 */
export interface JMAPHttpOptions {
  apiUrl: string
  accessToken: string
}

/**
 * Execute a JMAP request
 */
export async function executeJMAPRequest(
  request: JMAPRequest,
  options: JMAPHttpOptions,
): Promise<JMAPResponse> {
  const response = await fetch(options.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${options.accessToken}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new JMAPClientError(
      'httpError',
      `HTTP ${response.status}: ${response.statusText}`,
    )
  }

  const data = await response.json()
  return data as JMAPResponse
}

/**
 * Discover JMAP session from well-known URL
 */
export async function discoverJMAPSession(
  jmapUrl: string,
  accessToken: string,
): Promise<{
  session: JMAPSession
  apiUrl: string
  accountId: string
}> {
  // Normalize URL
  const baseUrl = jmapUrl.endsWith('/') ? jmapUrl.slice(0, -1) : jmapUrl
  const wellKnownUrl = `${baseUrl}/.well-known/jmap`

  const response = await fetch(wellKnownUrl, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new JMAPClientError('unauthorized', 'Invalid credentials')
    }
    throw new JMAPClientError(
      'sessionDiscoveryFailed',
      `Failed to discover JMAP session: HTTP ${response.status}`,
    )
  }

  const session = (await response.json()) as JMAPSession

  // Get primary mail account
  const mailAccountId = session.primaryAccounts['urn:ietf:params:jmap:mail']
  if (!mailAccountId) {
    throw new JMAPClientError(
      'noMailAccount',
      'No mail account found in session',
    )
  }

  return {
    session,
    apiUrl: session.apiUrl,
    accountId: mailAccountId,
  }
}

/**
 * Helper to create a simple JMAP client for server functions
 */
export function createJMAPClient(options: JMAPHttpOptions) {
  return {
    /**
     * Execute a request built with JMAPRequestBuilder
     */
    async execute(builder: JMAPRequestBuilder): Promise<JMAPResponseParser> {
      const request = builder.build()
      const response = await executeJMAPRequest(request, options)
      return new JMAPResponseParser(response)
    },

    /**
     * Execute a single method call
     */
    async call<T = Record<string, unknown>>(
      methodName: string,
      args: Record<string, unknown>,
      capabilities: Array<string> = [],
    ): Promise<T> {
      const builder = new JMAPRequestBuilder()
      capabilities.forEach((cap) => builder.addCapability(cap))
      const callId = builder.call(methodName, args)

      const parser = await this.execute(builder)
      return parser.get<T>(callId)
    },
  }
}

export type JMAPClient = ReturnType<typeof createJMAPClient>
