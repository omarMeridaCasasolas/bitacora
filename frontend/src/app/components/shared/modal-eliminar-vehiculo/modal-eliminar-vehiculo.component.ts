import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';

interface Vehiculo{
  id_vehiculo:string,
  placa_vehiculo:string,
  detalle_vehiculo:string
  tipo_vehiculo:string,
  estado_vehiculo: boolean
}

// interface Respuesta{
//   resultado: string
// }

@Component({
  selector: 'app-modal-eliminar-vehiculo',
  templateUrl: './modal-eliminar-vehiculo.component.html',
  styleUrls: ['./modal-eliminar-vehiculo.component.css']
})


export class ModalEliminarVehiculoComponent implements OnInit{
  data: Vehiculo;
  myForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<ModalEliminarVehiculoComponent>, private http: HttpClient, private snackBar: MatSnackBar ,@Inject(MAT_DIALOG_DATA) public message:Vehiculo){
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
        this.http.delete<any>(URL+'api/vehiculo/'+this.data.id_vehiculo,{headers})
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
