import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';

interface Respuesta{
  resultado: string
}

interface Unidad{
  id_unidad: string ,
  nombre_unidad: string
}

interface Usuario{
  id_usuario:string,
  carnet_usuario:string,
  nombre_usuario:string
  celular_usuario:string,
  estado_usuario: boolean,
  login_usuario:string,
  pass_usuario:string,
  id_unidad:string,
  nombre_unidad:string
}


@Component({
  selector: 'app-modal-editar-usuario',
  templateUrl: './modal-editar-usuario.component.html',
  styleUrls: ['./modal-editar-usuario.component.css']
})
export class ModalEditarUsuarioComponent implements OnInit{
  data: Usuario;
  myForm: FormGroup;
  opcionesUnidad: Unidad[] = [];
  selectedDefault:string = '';
  selectedOptionTextUnidad: string = '';
  constructor(public dialogRef: MatDialogRef<ModalEditarUsuarioComponent>, private http: HttpClient, private snackBar: MatSnackBar,@Inject(MAT_DIALOG_DATA) public message:Usuario) {
    this.data = message;
    // console.log(message);
    this.myForm = new FormGroup({
      nombre_usuario: new FormControl(this.data.nombre_usuario, [Validators.required]),
      carnet_usuario: new FormControl(this.data.carnet_usuario, [Validators.required]),
      celular_usuario: new FormControl(this.data.celular_usuario, [Validators.required]),
      estado_usuario: new FormControl(this.data.estado_usuario, [Validators.required]),
      login_usuario: new FormControl(this.data.login_usuario, [Validators.required]),
      pass_usuario: new FormControl(this.data.pass_usuario, [Validators.required]),
      id_unidad: new FormControl(this.data.id_unidad, [Validators.required])
    });
  }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    this.listaUnidadesDisponibles();
  }

  listaUnidadesDisponibles(){
    this.http.get<Unidad[]>(URL+'api/unidadDisponibles')
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

  cerrarDialog(): void {
    this.dialogRef.close();
  }

  onSelectionChange(event: any) {
    const selectedOption = event.source.selected.viewValue;
    this.selectedOptionTextUnidad = selectedOption;
  }

  editarUsuario(): void {
    if (this.myForm.valid) {
      let formData = this.myForm.value;
      formData['id_usuario'] = this.data.id_usuario;
      formData['nombre_unidad'] = this.selectedOptionTextUnidad;
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.put<any>(URL+'api/usuario',formData,{headers})
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
