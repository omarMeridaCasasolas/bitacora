import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';

// interface Respuesta{
//   resultado: string
// }

interface Chofer{
  id_chofer:string,
  carnet_chofer:string,
  nombre_chofer:string,
  celular_chofer:string,
  estado_chofer: boolean,
  login_chofer:string,
  pass_chofer:string
}

@Component({
  selector: 'app-modal-editar-chofer',
  templateUrl: './modal-editar-chofer.component.html',
  styleUrls: ['./modal-editar-chofer.component.css']
})
export class ModalEditarChoferComponent {
  data: Chofer;
  myForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<ModalEditarChoferComponent>, private http: HttpClient, private snackBar: MatSnackBar,@Inject(MAT_DIALOG_DATA) public message:Chofer) {
    this.data = message;
    console.log(message);
    this.myForm = new FormGroup({
      nombre_chofer: new FormControl(this.data.nombre_chofer, [Validators.required]),
      carnet_chofer: new FormControl(this.data.carnet_chofer, [Validators.required]),
      celular_chofer: new FormControl(this.data.celular_chofer, [Validators.required]),
      estado_chofer: new FormControl(this.data.estado_chofer, [Validators.required]),
      login_chofer: new FormControl(this.data.login_chofer, [Validators.required]),
      pass_chofer: new FormControl(this.data.pass_chofer, [Validators.required])
    });
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }

  editarChofer(): void {
    if (this.myForm.valid) {
      let formData = this.myForm.value;
      formData['id_chofer'] = this.data.id_chofer;
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.put<any>(URL+'api/chofer',formData,{headers})
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
    this.dialogRef.close();
  }

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}
