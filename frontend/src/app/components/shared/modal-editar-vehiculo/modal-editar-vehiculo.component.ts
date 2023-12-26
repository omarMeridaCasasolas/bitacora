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
  detalle_vehiculo:string,
  tipo_vehiculo:string,
  km_vehiculo:string,
  estado_vehiculo: boolean,
  id_unidad:string,
  nombre_unidad:string
}

// interface  Respuesta{
//   resultado: string
// }

interface Unidad{
  id_unidad: string ,
  nombre_unidad: string
}

@Component({
  selector: 'app-modal-editar-vehiculo',
  templateUrl: './modal-editar-vehiculo.component.html',
  styleUrls: ['./modal-editar-vehiculo.component.css']
})
export class ModalEditarVehiculoComponent implements OnInit{
  data: Vehiculo;
  myForm: FormGroup;
  opcionesUnidad: Unidad[] = [];
  selectedDefault:string = '';
  selectedOptionTextUnidad: string = '';
  constructor(public dialogRef: MatDialogRef<ModalEditarVehiculoComponent>, private http: HttpClient, private snackBar: MatSnackBar ,@Inject(MAT_DIALOG_DATA) public message:Vehiculo){
    this.data = message;
    // console.log(this.data);
    this.myForm = new FormGroup({
      detalle_vehiculo: new FormControl(this.data.detalle_vehiculo, [Validators.required]),
      placa_vehiculo: new FormControl(this.data.placa_vehiculo, [Validators.required]),
      tipo_vehiculo: new FormControl(this.data.tipo_vehiculo, [Validators.required]),
      estado_vehiculo: new FormControl(this.data.estado_vehiculo, [Validators.required]),
      km_vehiculo: new FormControl(this.data.km_vehiculo, [Validators.required]),
      id_unidad: new FormControl(this.data.id_unidad, [Validators.required]),
    });
  }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    this.listaUnidadesDisponibles();
  }

  onSelectionChange(event: any) {
    const selectedOption = event.source.selected.viewValue;
    this.selectedOptionTextUnidad = selectedOption;
  }
  
  cerrarDialog(): void {
    this.dialogRef.close();
  }

  confirmarPedido(): void {
    if (this.myForm.valid) {
      let formData = this.myForm.value;
      formData['id_vehiculo'] = this.data.id_vehiculo;
      formData['nombre_unidad'] = this.selectedOptionTextUnidad;
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.put<any>(URL+'api/vehiculo',formData,{headers})
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

  listaUnidadesDisponibles(){
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get<Unidad[]>(URL+'api/unidadDisponibles',{headers})
          .pipe(
          tap(response  => {
              console.log(response);
              this.opcionesUnidad = response;
          }),
          finalize(() => {
              // Realizar acciones finales después de completar la petición
          })
          )
      .subscribe();
    }
  }
}
