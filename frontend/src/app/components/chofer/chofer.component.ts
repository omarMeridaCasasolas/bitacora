import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { finalize } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { ModalAgregarChoferComponent } from '../shared/modal-agregar-chofer/modal-agregar-chofer.component';
import { ModalEliminarChoferComponent } from '../shared/modal-eliminar-chofer/modal-eliminar-chofer.component';
import { ModalEditarChoferComponent } from '../shared/modal-editar-chofer/modal-editar-chofer.component';
import {jwtDecode} from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AsignarVehiculoComponent } from '../shared/asignar-vehiculo/asignar-vehiculo.component';

const URL:string = 'http://localhost:3000/';

interface Chofer{
  id_chofer:string,
  carnet_chofer:string,
  nombre_chofer:string
  celular_chofer:string,
  estado_chofer:boolean,
  login_choder: string,
  pass_chofer: string
}

interface Vehiculo {
  id_vehiculo: string,
  nombre: string,
  checked: boolean
}

interface respuesta{
  estado: string
}

@Component({
  selector: 'app-chofer',
  templateUrl: './chofer.component.html',
  styleUrls: ['./chofer.component.css']
})
export class ChoferComponent {
  displayedColumns: string[] = ['Carnet', 'Nombre', 'Celular', 'Login', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Chofer>();
  cargo?: string | null;
  opcionesVehiculo: Vehiculo[] = [];
  constructor(private http: HttpClient, public dialog: MatDialog, private socket: Socket, private router: Router, private snackBar: MatSnackBar){}

  ngOnInit(): void {
    this.cargo = this.getUserCargo();
    this.solicitarChofer();
    this.getListaVehiculosDisponibles();

    this.socket.on('agregarChofer', (data: Chofer) => {
      this.dataSource.data.push(data); 
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha agregado un nuevo chofer');
    });

    this.socket.on('eliminarChofer', (data: string) => {
      let index = this.dataSource.data.findIndex( x=>{
        return x.id_chofer == data;
      });
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha eliminado registro del chofer');
    });

    this.socket.on('editarChofer', (data: Chofer) => {
      let index = this.dataSource.data.findIndex( x=>{
        return x.id_chofer == data.id_chofer;
      });
      this.dataSource.data.splice(index, 1);
      this.dataSource.data.push(data); 
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha actualizado los registros del chofer');
    });

  }

  getListaVehiculosDisponibles():void{
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get<Vehiculo[]>(URL+'api/vehiculosDisponibles',{ headers })
        .pipe(
        tap(response  => {
          this.opcionesVehiculo = response;
        }),
        finalize(() => {
            // Realizar acciones finales después de completar la petición
        })
        )
      .subscribe();
    }
  }

  solicitarChofer(){
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get<Chofer[]>(URL+'api/chofer', {headers})
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



  abrirDialog() {
    const dialogRef = this.dialog.open(ModalAgregarChoferComponent, {
      width: '450px',
      data: { /* Puedes pasar datos al diálogo si es necesario */ }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);
    });
  }

  eliminarChofer(element: any){
    // console.log(row);
    const dialogRef = this.dialog.open(ModalEliminarChoferComponent, {
      width: '450px',
      data:  element 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);

      // let index = this.dataSource.data.findIndex( x=>{
      //   return x.id_usuario == element.id_usuario;
      // });
      // this.dataSource.data.splice(index, 1);
      // this.dataSource.data = [...this.dataSource.data];
    });
  }

  editarChofer(element: any){
    // console.log(row);
    const dialogRef = this.dialog.open(ModalEditarChoferComponent, {
      width: '450px',
      data:  element 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);
    });
  }

  asignarVehiculo(element: any){
    // console.log(element);
    this.opcionesVehiculo.forEach(element => {
      element.checked = false;
    });
    const dialogRef = this.dialog.open(AsignarVehiculoComponent, {
      width: '450px',
      data:  {opciones: this.opcionesVehiculo, chofer: element} 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);
    });
  }

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, // Duración en milisegundos que se mostrará la alerta (opcional)
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
    // console.log(decodedToken);
    return decodedToken ? decodedToken.cargo : null;
  }
}
