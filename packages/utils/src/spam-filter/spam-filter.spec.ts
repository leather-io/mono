import { spamFilter, spamReplacement } from './spam-filter';

describe('Spam filter', () => {
  it('should allow valid tokens', () => {
    expect(spamFilter('This token name is OK')).not.toEqual(spamReplacement);
  });

  it('should detect tlds with dot in strings and replace content', () => {
    expect(spamFilter('fake.com')).toEqual(spamReplacement);
    expect(spamFilter('random text http://fake.de')).toEqual(spamReplacement);
    expect(spamFilter('random text .    de')).toEqual(spamReplacement);
  });

  it('should allow if without tld or with tld without dot', () => {
    expect(spamFilter('www.fake')).toEqual('www.fake');
    expect(spamFilter('random text http://fake')).toEqual('random text http://fake');
    expect(spamFilter('random text xxx com')).toEqual('random text xxx com');
  });

  it('should detect spam words in strings and replace content', () => {
    expect(spamFilter('You won some stx')).toEqual(spamReplacement);
    expect(spamFilter('You Win some stx')).toEqual(spamReplacement);
    expect(spamFilter('You Won some stx')).toEqual(spamReplacement);
    expect(spamFilter('click here for some stx')).toEqual(spamReplacement);
    expect(spamFilter('Click here for some stx')).toEqual(spamReplacement);
  });
});
