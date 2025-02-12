import { spamFilter, spamReplacement } from './spam-filter';

describe('Spam filter', () => {
  it('should allow valid tokens', () => {
    expect(spamFilter({ input: 'This token name is OK', whitelist: [] })).not.toEqual(
      spamReplacement
    );
  });

  it('should detect tlds with dot in strings and replace content', () => {
    expect(spamFilter({ input: 'fake.com', whitelist: [] })).toEqual(spamReplacement);
    expect(spamFilter({ input: 'random text http://fake.de', whitelist: [] })).toEqual(
      spamReplacement
    );
    expect(spamFilter({ input: 'random text .    de', whitelist: [] })).toEqual(spamReplacement);
  });

  it('should allow if without tld or with tld without dot', () => {
    expect(spamFilter({ input: 'www.fake', whitelist: [] })).toEqual('www.fake');
    expect(spamFilter({ input: 'random text http://fake', whitelist: [] })).toEqual(
      'random text http://fake'
    );
    expect(spamFilter({ input: 'random text xxx com', whitelist: [] })).toEqual(
      'random text xxx com'
    );
  });

  it('should detect spam words in strings and replace content', () => {
    expect(spamFilter({ input: 'You won some stx', whitelist: [] })).toEqual(spamReplacement);
    expect(spamFilter({ input: 'You Win some stx', whitelist: [] })).toEqual(spamReplacement);
    expect(spamFilter({ input: 'You Won some stx', whitelist: [] })).toEqual(spamReplacement);
    expect(spamFilter({ input: 'click here for some stx', whitelist: [] })).toEqual(
      spamReplacement
    );
    expect(spamFilter({ input: 'Click here for some stx', whitelist: [] })).toEqual(
      spamReplacement
    );
  });
});
