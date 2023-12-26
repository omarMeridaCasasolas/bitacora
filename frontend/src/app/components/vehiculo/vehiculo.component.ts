import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { tap, finalize } from 'rxjs/operators';

// import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// import { MatDialog } from '@angular/material/dialog';
import { ModalAgregarVehiculoComponent } from '../shared/modal-agregar-vehiculo/modal-agregar-vehiculo.component';
import { ModalEliminarVehiculoComponent } from '../shared/modal-eliminar-vehiculo/modal-eliminar-vehiculo.component';
import { ModalEditarVehiculoComponent } from '../shared/modal-editar-vehiculo/modal-editar-vehiculo.component';

import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';

const URL:string = 'http://localhost:3000/';

interface Vehiculo{
  id_vehiculo:string,
  placa_vehiculo:string,
  detalle_vehiculo:string,
  tipo_vehiculo:string,
  km_vehiculo:string,
  nombre_unidad:string,
  id_unidad:string,
  estado_vehiculo: boolean
}


interface respuesta{
  estado: string
}


@Component({
  selector: 'app-vehiculo',
  templateUrl: './vehiculo.component.html',
  styleUrls: ['./vehiculo.component.css'],
})
export class VehiculoComponent implements OnInit{
  displayedColumns: string[] = ['Placa', 'Detalle', 'Tipo', 'Kilometro', 'estado', 'Unidad', 'acciones'];
  dataSource = new MatTableDataSource<Vehiculo>();
  cargo?: string | null;
  constructor(private http: HttpClient, public dialog: MatDialog, private socket: Socket,private router: Router, private snackBar: MatSnackBar){}
  ngOnInit(): void {
    this.cargo = this.getUserCargo();
    this.solicitarVehiculos();

    this.socket.on('agregarVehiculo', (data: Vehiculo) => {
      this.dataSource.data.push(data); 
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha agregado un nuevo vehiculo');
    });
    
    this.socket.on('eliminarVehiculo', (data: string) => {
      let index = this.dataSource.data.findIndex( x=>{
        return x.id_vehiculo == data;
      });
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha eliminado registro del vehiculo');
    });

    this.socket.on('editarVehiculo', (data: Vehiculo) => {
      let index = this.dataSource.data.findIndex( x=>{
        return x.id_vehiculo == data.id_vehiculo;
      });
      this.dataSource.data.splice(index, 1);
      this.dataSource.data.push(data); 
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha actualizado los registros del vehiculo');
    });

    // this.socket.emit('mensajeAlServidor', { mensaje: 'Hola desde Angular' });

    // this.socket.on('mensajeDesdeServidor', (data: any) => {
    //   console.log('Mensaje recibido desde el servidor:', data);
    // });
  }

  solicitarVehiculos(){
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get<Vehiculo[]>(URL+'api/vehiculo', {headers})
      .pipe(
        tap(response  => {
          // console.log(response);
          // console.log(ELEMENT_DATA);
          this.dataSource = new MatTableDataSource(response);
        }),
        finalize(() => {
          // Realizar acciones finales después de completar la petición
        })
      )
      .subscribe();
    }
  }

  // Función para manejar el clic en el botón
  hacerAlgo(element: any) {
    // Puedes realizar alguna acción aquí, por ejemplo, mostrar un mensaje
    console.log('Botón clickeado para:', element);
  }
  abrirModalAgregar(){
    this.abrirDialog();
  }

  abrirDialog() {
    const dialogRef = this.dialog.open(ModalAgregarVehiculoComponent, {
      width: '450px',
      data: { /* Puedes pasar datos al diálogo si es necesario */ }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);
    });
  }

  eliminarVehiculo(element: any){
    // console.log(row);
    const dialogRef = this.dialog.open(ModalEliminarVehiculoComponent, {
      width: '450px',
      data:  element 
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  editarVehiculo(element: any){
    // console.log(row);
    const dialogRef = this.dialog.open(ModalEditarVehiculoComponent, {
      width: '450px',
      data:  element 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);
    });
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getDecodedToken(): any {
  const token = this.getToken();
  return token ? jwtDecode(token) : null;
  }

  getUserCargo(): string | null {
      const decodedToken = this.getDecodedToken();
      console.log(decodedToken);
      return decodedToken ? decodedToken.cargo : null;
  }

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}

