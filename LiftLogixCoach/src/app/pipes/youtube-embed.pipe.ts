import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

@Pipe({
  name: 'youtubeEmbed'
})
export class YoutubeEmbedPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): string {
    const regex = /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]+)(?:&.*)?$/;
    const match = value.match(regex);
    if (match && match[1]) {
      const videoId = match[1];
      return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    }
    return value;
  }
}
