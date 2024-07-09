import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Application} from "../../interfaces/Application";

@Component({
  selector: 'app-application-details-dialog',
  templateUrl: './application-details-dialog.component.html',
  styleUrl: './application-details-dialog.component.scss'
})
export class ApplicationDetailsDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: Application) {}

  sendMessage(): void {}
}
