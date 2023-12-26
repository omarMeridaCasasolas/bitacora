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
  selector: 'app-modal-editar-unidad',
  templateUrl: './modal-editar-unidad.component.html',
  styleUrls: ['./modal-editar-unidad.component.css']
})
export class ModalEditarUnidadComponent {
  data: Unidad;
  myForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<ModalEditarUnidadComponent>, private http: HttpClient, private snackBar: MatSnackBar,@Inject(MAT_DIALOG_DATA) public message:Unidad) {
    this.data = message;
    this.myForm = new FormGroup({
      nombre_unidad: new FormControl(this.data.nombre_unidad, [Validators.required]),
      descripcion_unidad: new FormControl(this.data.descripcion_unidad, [Validators.required]),
      estado_unidad: new FormControl(this.data.estado_unidad, [Validators.required])
    });
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }

  editarUnidad(): void {
    if (this.myForm.valid) {
      let formData = this.myForm.value;
      formData['id_unidad'] = this.data.id_unidad;
      // console.log(formData.id_vehiculo : this.data.id_vehiculo);
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.put<any>(URL+'api/unidad',formData,{headers})
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
    this.dialogRef.close();
  }

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}
