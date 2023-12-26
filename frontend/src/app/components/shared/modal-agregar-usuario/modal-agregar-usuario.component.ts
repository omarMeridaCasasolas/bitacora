import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';

// interface Respuesta{
//   resultado: string
// }

interface Unidad{
  id_unidad: string ,
  nombre_unidad: string
}

@Component({
  selector: 'app-modal-agregar-usuario',
  templateUrl: './modal-agregar-usuario.component.html',
  styleUrls: ['./modal-agregar-usuario.component.css']
})
export class ModalAgregarUsuarioComponent implements OnInit{
  myForm: FormGroup;
  // snackBar: any;
  opcionesUnidad: Unidad[] = [];
  selectedDefault:string = '';
  selectedOptionTextUnidad: string = '';
  constructor(public dialogRef: MatDialogRef<ModalAgregarUsuarioComponent>, private http: HttpClient, private snackBar: MatSnackBar) {
    this.myForm = new FormGroup({
      nombre_usuario: new FormControl('', [Validators.required]),
      carnet_usuario: new FormControl('', [Validators.required]),
      celular_usuario: new FormControl('', [Validators.required]),
      estado_usuario: new FormControl('', [Validators.required]),
      login_usuario: new FormControl('', [Validators.required]),
      pass_usuario: new FormControl('', [Validators.required]),
      id_unidad: new FormControl('', [Validators.required]),
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

  agregarUsuario(){
    if (this.myForm.valid) {
      const formData = this.myForm.value;
      formData['nombre_unidad'] = this.selectedOptionTextUnidad;
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.post<any>(URL+'api/usuario',formData, {headers})
        .pipe(
          tap(response  => {
            // this.dialogRef.close();
            // this.showAlert(response.resultado.toString() == '1' ? 'Exito se ha guardado la vehiculo' : response.resultado.toString());
            this.dialogRef.close();
            if (response.hasOwnProperty('error')) {
              this.showAlert(response.error.toString());
            }
            finalize(() => {
            })
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
