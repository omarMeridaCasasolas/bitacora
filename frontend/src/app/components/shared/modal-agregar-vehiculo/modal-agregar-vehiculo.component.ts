import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';

// interface  respuesta{
//   resultado: string
// }

interface Unidad{
  id_unidad: string ,
  nombre_unidad: string
}

@Component({
  selector: 'app-modal-agregar-vehiculo',
  templateUrl: './modal-agregar-vehiculo.component.html',
  styleUrls: ['./modal-agregar-vehiculo.component.css']
})
export class ModalAgregarVehiculoComponent implements OnInit{
  myForm: FormGroup;
  opcionesUnidad: Unidad[] = [];
  selectedDefault:string = '';
  selectedOptionTextUnidad: string = '';
  // snackBar: any;
  constructor(public dialogRef: MatDialogRef<ModalAgregarVehiculoComponent>, private http: HttpClient, private snackBar: MatSnackBar) {
    this.myForm = new FormGroup({
      detalle_vehiculo: new FormControl('', [Validators.required]),
      placa_vehiculo: new FormControl('', [Validators.required]),
      tipo_vehiculo: new FormControl('', [Validators.required]),
      estado_vehiculo: new FormControl('', [Validators.required]),
      km_vehiculo: new FormControl('', [Validators.required]),
      id_unidad: new FormControl('', [Validators.required])
    });
  }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    this.listaUnidadesDisponibles();
  }

  cerrarDialog(): void {
    this.dialogRef.close();
  }

  onSelectionChange(event: any) {
    // event.source is the MatSelect
    // event.value is the selected option value
    const selectedOption = event.source.selected.viewValue;
    // console.log(selectedOption);
    this.selectedOptionTextUnidad = selectedOption;
  }

  enviarPeticion(){
    if (this.myForm.valid) {
      const formData = this.myForm.value;
      formData['nombre_unidad'] = this.selectedOptionTextUnidad;
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.post<any>(URL+'api/vehiculo',formData,{headers})
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

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}
