import { beforeEach, describe, expect, it } from 'vitest'
import {
  JMAPClientError,
  JMAPRequestBuilder,
  JMAPResponseParser,
  resetCallIdCounter,
} from './client'

beforeEach(() => {
  resetCallIdCounter()
})

describe('JMAPRequestBuilder', () => {
  it('always includes the core capability without duplicates', () => {
    const request = new JMAPRequestBuilder()
      .addCapability('urn:ietf:params:jmap:mail')
      .addCapabilities([
        'urn:ietf:params:jmap:core',
        'urn:ietf:params:jmap:mail',
      ])
      .build()

    expect(request.using).toEqual([
      'urn:ietf:params:jmap:core',
      'urn:ietf:params:jmap:mail',
    ])
  })

  it('generates sequential call IDs and keeps call order', () => {
    const builder = new JMAPRequestBuilder()
    const first = builder.call('Mailbox/get', { accountId: 'a' })
    const second = builder.call('Identity/get', { accountId: 'a' })

    expect(first).toBe('call-0')
    expect(second).toBe('call-1')
    expect(builder.length).toBe(2)
    expect(builder.build().methodCalls).toEqual([
      ['Mailbox/get', { accountId: 'a' }, 'call-0'],
      ['Identity/get', { accountId: 'a' }, 'call-1'],
    ])
  })

  it('builds back-references that name the referenced method', () => {
    const builder = new JMAPRequestBuilder()
    const queryId = builder.call('Email/query', { accountId: 'a' }, 'q')
    builder.call(
      'Email/get',
      { accountId: 'a', '#ids': builder.ref(queryId, '/ids') },
      'g',
    )

    expect(builder.build().methodCalls[1]).toEqual([
      'Email/get',
      {
        accountId: 'a',
        '#ids': { resultOf: 'q', name: 'Email/query', path: '/ids' },
      },
      'g',
    ])
  })

  it('rejects back-references to unknown calls', () => {
    const builder = new JMAPRequestBuilder()
    expect(() => builder.ref('missing', '/ids')).toThrow(
      'Unknown call ID: missing',
    )
  })
})

describe('JMAPResponseParser', () => {
  const parser = new JMAPResponseParser({
    sessionState: 's1',
    methodResponses: [
      ['Email/query', { ids: ['m1', 'm2'] }, 'q'],
      ['error', { type: 'invalidArguments', description: 'bad filter' }, 'g'],
    ],
  })

  it('returns results by call ID', () => {
    expect(parser.get<{ ids: Array<string> }>('q').ids).toEqual(['m1', 'm2'])
    expect(parser.isError('q')).toBe(false)
  })

  it('throws JMAPClientError for method-level errors', () => {
    expect(parser.isError('g')).toBe(true)
    expect(() => parser.get('g')).toThrow(JMAPClientError)
    expect(() => parser.get('g')).toThrow('bad filter')
  })

  it('throws for call IDs with no response', () => {
    expect(parser.isError('nope')).toBe(false)
    expect(() => parser.get('nope')).toThrow('No response for call ID: nope')
  })
})
