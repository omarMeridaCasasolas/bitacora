import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { finalize, tap } from 'rxjs/operators';
import { ModalAgregarUnidadComponent } from '../shared/modal-agregar-unidad/modal-agregar-unidad.component';
import { ModalEliminarUnidadComponent } from '../shared/modal-eliminar-unidad/modal-eliminar-unidad.component';
import { ModalEditarUnidadComponent } from '../shared/modal-editar-unidad/modal-editar-unidad.component';
import {jwtDecode} from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';

const URL:string = 'http://localhost:3000/';

interface Unidad{
  id_unidad:Number,
  nombre_unidad:string,
  descripcion_unidad:string,
  estado_unidad: boolean
}

interface respuesta{
  estado: string
}

@Component({
  selector: 'app-unidad',
  templateUrl: './unidad.component.html',
  styleUrls: ['./unidad.component.css']
})
export class UnidadComponent {
  displayedColumns: string[] = ['ID', 'Nombre', 'Descripcion', 'Estado',  'acciones'];
  dataSource = new MatTableDataSource<Unidad>();
  cargo?: string | null;
  constructor(private http: HttpClient, public dialog: MatDialog, private socket: Socket, private router: Router, private snackBar: MatSnackBar){}

  ngOnInit(): void {
    this.cargo = this.getUserCargo();
    this.solicitarListaUnidades();

    this.socket.on('agregarUnidad', (data: Unidad) => {
      this.dataSource.data.push(data); 
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha agregado un nuevo usuario '+data.nombre_unidad);
    });

    this.socket.on('eliminarUnidad', (data: any) => {
      let index = this.dataSource.data.findIndex( x=>{
        return x.id_unidad == data;
      });
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha elimnado un registro de usuario');
    });

    this.socket.on('editarUnidad', (data: Unidad) => {
      let index = this.dataSource.data.findIndex( x=>{
        return x.id_unidad == data.id_unidad;
      });
      this.dataSource.data.splice(index, 1);
      this.dataSource.data.push(data); 
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha actualizado los registros del usuario '+data.nombre_unidad);
    });
  }

  solicitarListaUnidades(){
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get<Unidad[]>(URL+'api/unidad',{headers})
      .pipe(
        tap(response  => {
          console.log(response);
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
    const dialogRef = this.dialog.open(ModalAgregarUnidadComponent, {
      width: '550px',
      data: { /* Puedes pasar datos al diálogo si es necesario */ }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);
    });
  }

  eliminarUnidad(element: any){
    // console.log(row);
    const dialogRef = this.dialog.open(ModalEliminarUnidadComponent, {
      width: '450px',
      data:  element 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);
    });
  }

  editarUnidad(element: any){
    // console.log(row);
    const dialogRef = this.dialog.open(ModalEditarUnidadComponent, {
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
      duration: 4000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}
