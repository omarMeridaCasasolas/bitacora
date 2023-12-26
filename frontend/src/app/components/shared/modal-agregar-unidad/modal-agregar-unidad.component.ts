import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';

@Component({
  selector: 'app-modal-agregar-unidad',
  templateUrl: './modal-agregar-unidad.component.html',
  styleUrls: ['./modal-agregar-unidad.component.css']
})
export class ModalAgregarUnidadComponent {
  myForm: FormGroup;
  // snackBar: any;
  constructor(public dialogRef: MatDialogRef<ModalAgregarUnidadComponent>, private http: HttpClient, private snackBar: MatSnackBar) {
    this.myForm = new FormGroup({
      nombre_unidad: new FormControl('', [Validators.required]),
      descripcion_unidad: new FormControl('', [Validators.required]),
      estado_unidad: new FormControl('', [Validators.required])
    });
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }

  agregarUnidad(){
    // console.log('aquyieie');
    if (this.myForm.valid) {
      const formData = this.myForm.value;
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.post<any>(URL+'api/unidad',formData)
        .pipe(
          tap(response  => {
            this.dialogRef.close();
            if (response.hasOwnProperty('error')) {
              this.showAlert(response.error.toString());
            }
          }),
          finalize(() => {
            // Realizar acciones finales después de completar la petición
          })
        )
        .subscribe();
      }
    }
  }

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}
