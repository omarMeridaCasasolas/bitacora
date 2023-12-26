import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';

// interface Respuesta{
//   resultado: string
// }

interface Unidad{
  id_unidad:Number,
  nombre_unidad:string,
  descripcion_unidad:string,
  estado_unidad: boolean
}

@Component({
  selector: 'app-modal-eliminar-unidad',
  templateUrl: './modal-eliminar-unidad.component.html',
  styleUrls: ['./modal-eliminar-unidad.component.css']
})
export class ModalEliminarUnidadComponent {
  data: Unidad;
  myForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<ModalEliminarUnidadComponent>, private http: HttpClient, private snackBar: MatSnackBar ,@Inject(MAT_DIALOG_DATA) public message:Unidad){
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
        this.http.delete<any>(URL+'api/unidad/'+this.data.id_unidad,{headers})
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
    this.dialogRef.close(true);
  }

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}
