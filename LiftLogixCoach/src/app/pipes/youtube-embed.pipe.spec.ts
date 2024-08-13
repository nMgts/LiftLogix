import { YoutubeEmbedPipe } from './youtube-embed.pipe';

describe('YoutubeEmbedPipe', () => {
  it('create an instance', () => {
    const pipe = new YoutubeEmbedPipe();
    expect(pipe).toBeTruthy();
  });
});
