import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';

interface Usuario{
  id_usuario:string,
  carnet_usuario:string,
  nombre_usuario:string
  celular_usuario:string,
  estado_usuario: boolean,
  login_usuario:string
  pass_usuario:string
}

@Component({
  selector: 'app-modal-eliminar-usuario',
  templateUrl: './modal-eliminar-usuario.component.html',
  styleUrls: ['./modal-eliminar-usuario.component.css']
})
export class ModalEliminarUsuarioComponent implements OnInit{
  data: Usuario;
  myForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<ModalEliminarUsuarioComponent>, private http: HttpClient, private snackBar: MatSnackBar ,@Inject(MAT_DIALOG_DATA) public message:Usuario){
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
        this.http.delete<any>(URL+'api/usuario/'+this.data.id_usuario,{headers})
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
