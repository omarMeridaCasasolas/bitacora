import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef , MAT_DIALOG_DATA  } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {jwtDecode} from 'jwt-decode';

const URL:string = 'http://localhost:3000/';

interface pdoReserva {
  horario_inicio:string,
  horario_final:string,
  time:string,
  tiempo:string,
  dia: string
}

interface Data{
  horariosDisponibles: pdoReserva [],
  idVehiculo: string
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})

export class ConfirmDialogComponent implements OnInit {
  data : pdoReserva[] = [
    { horario_inicio: 'opcion1', horario_final: 'Opción 1', time:'10:10:10', tiempo:'10:00:00', dia:'2023-10-10' }
  ];
  opcionSeleccionada: string = 'opcion1';
  
  opcionSeleccionadaCliente: string = 'opcion1';
  listaUsuarios: any = {};
  myForm: FormGroup;
  durationInSeconds: number = 5;
  isDisabled: boolean = false;
  isDisabledKilometro: boolean = false;
  identificador?: string | null;
  cargo?: string | null;
  idVehiculo?: string | null;

  constructor(private http: HttpClient, public dialogRef: MatDialogRef<ConfirmDialogComponent>, @Inject(MAT_DIALOG_DATA) public message:Data, private snackBar: MatSnackBar){
    this.data = message.horariosDisponibles;
    this.idVehiculo = message.idVehiculo;
    console.log(message);
    this.myForm = new FormGroup({
      destino: new FormControl('', [Validators.required]),
      usuario: new FormControl('', [Validators.required]),
      nroVale: new FormControl({value: '', disabled: this.isDisabled}),
      horario: new FormControl('', [Validators.required]),
      kmInicial: new FormControl({value: '', disabled: this.isDisabled}),
      kmFinal: new FormControl({value: '', disabled: this.isDisabledKilometro}),
      fecha: new FormControl(this.data[0].dia),
      horarioInicio: new FormControl(this.data[0].time),
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if(token){
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get(URL+'api/usuario',{headers})
      .pipe(
        tap(response  => {
          this.listaUsuarios = response;
          this.cargo = this.getUserCargo();
          if(this.cargo == 'usuario'){
            this.identificador = this.getUserID();
            this.isDisabled = true;
            this.isDisabledKilometro = true;
          }else{
            // this.isDisabled = false;

          }
        }),
        finalize(() => {
          // Realizar acciones finales después de completar la petición
        })
      )
      .subscribe();
    }
  }

  onClickNo(): void {
    if (this.myForm.valid) {
      const formData = this.myForm.value;
      formData['id_vehiculo'] = this.idVehiculo;
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new HttpHeaders().set('Authorization', token);
        this.http.post<any>(URL+'api/reserva',formData, {headers})
        .pipe(
          // tap(response  => {
          //   this.dialogRef.close('exito');
          //   this.showAlert(response.toString() == '1' ? 'Exito se ha guardado la reserva' : response.toString());
          // }),
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

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getDecodedToken(): any {
    const token = this.getToken();
    return token ? jwtDecode(token) : null;
  }

  getUserID(): string | null {
      const decodedToken = this.getDecodedToken();
      return decodedToken ? decodedToken.identificador : null;
  }

  getUserCargo(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.cargo : null;
  }
}

