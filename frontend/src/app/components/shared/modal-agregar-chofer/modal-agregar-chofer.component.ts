import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';

// interface Respuesta{
//   resultado: string
// }

@Component({
  selector: 'app-modal-agregar-chofer',
  templateUrl: './modal-agregar-chofer.component.html',
  styleUrls: ['./modal-agregar-chofer.component.css']
})
export class ModalAgregarChoferComponent {
  myForm: FormGroup;
  // snackBar: any;
  constructor(public dialogRef: MatDialogRef<ModalAgregarChoferComponent>, private http: HttpClient, private snackBar: MatSnackBar) {
    this.myForm = new FormGroup({
      nombre_chofer: new FormControl('', [Validators.required]),
      carnet_chofer: new FormControl('', [Validators.required]),
      celular_chofer: new FormControl('', [Validators.required]),
      estado_chofer: new FormControl('', [Validators.required]),
      login_chofer: new FormControl('', [Validators.required]),
      pass_chofer: new FormControl('', [Validators.required])
    });
  }

  editarUsuario(){
    if (this.myForm.valid) {
      const formData = this.myForm.value;
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.post<any>(URL+'api/chofer',formData, {headers})
        .pipe(
          tap(response  => {
            this.dialogRef.close();
            if (response.hasOwnProperty('error')) {
              this.showAlert(response.error.toString());
            }
          }),
          finalize(() => {
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
