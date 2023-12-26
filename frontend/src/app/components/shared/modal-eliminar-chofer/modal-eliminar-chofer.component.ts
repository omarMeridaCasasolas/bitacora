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
  nombre_chofer:string
  celular_chofer:string,
  estado_chofer: boolean,
  login_chofer:string
  pass_chofer:string
}

@Component({
  selector: 'app-modal-eliminar-chofer',
  templateUrl: './modal-eliminar-chofer.component.html',
  styleUrls: ['./modal-eliminar-chofer.component.css']
})
export class ModalEliminarChoferComponent {
  data: Chofer;
  myForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<ModalEliminarChoferComponent>, private http: HttpClient, private snackBar: MatSnackBar ,@Inject(MAT_DIALOG_DATA) public message:Chofer){
    this.data = message;
    console.log(this.data);
    this.myForm = new FormGroup({
      check: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {

    // throw new Error('Method not implemented.');
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }

  confirmarEliminacion(): void {
    if (this.myForm.valid) {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.delete<any>(URL+'api/chofer/'+this.data.id_chofer,{headers})
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
    this.dialogRef.close(true);
  }

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}
