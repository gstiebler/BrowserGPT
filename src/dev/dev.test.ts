import execute from './promptTest';

describe('dev', () => {
  it('should work', async () => {
    const result = await execute();
    expect(result).toEqual('dev');
  });
});
