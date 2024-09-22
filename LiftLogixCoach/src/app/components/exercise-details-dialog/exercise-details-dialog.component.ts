import { AfterViewInit, Component, ElementRef, HostListener, Inject, Renderer2, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: 'app-exercise-details-dialog',
  templateUrl: './exercise-details-dialog.component.html',
  styleUrl: './exercise-details-dialog.component.scss'
})
export class ExerciseDetailsDialogComponent implements AfterViewInit {
  safeUrl: SafeHtml;
  safeDescription: SafeHtml;
  scrollTimeout: any;
  @ViewChild('dialog', { static: true }) dialog!: ElementRef;

  bodyPartsTranslations: { [key: string]: string } = {
    'CHEST': 'KLATKA',
    'BACK': 'PLECY',
    'BICEPS': 'BICEPS',
    'TRICEPS': 'TRICEPS',
    'SHOULDERS': 'BARKI',
    'FOREARMS': 'PRZEDRAMIONA',
    'ABS': 'BRZUCH',
    'CALVES': 'ŁYDKI',
    'QUAD': 'CZWOROGŁOWE',
    'HAMSTRING': 'DWUGŁOWE',
    'GLUTE': 'POŚLADKI'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<ExerciseDetailsDialogComponent>,
    private renderer: Renderer2,
  ) {
    const description = data.description.replace(/\r\n/g, '<br>');
    this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(description);
    this.safeUrl = this.sanitizer.bypassSecurityTrustHtml(data.url);
  }

  ngAfterViewInit(): void {
    this.renderer.listen(this.dialog.nativeElement, 'scroll', () => {
      this.onWindowScroll();
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.renderer.addClass(document.body, 'show-scrollbar');

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.renderer.removeClass(document.body, 'show-scrollbar');
    }, 3000);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
