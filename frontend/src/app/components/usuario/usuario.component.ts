import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { tap, finalize } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
import { ModalAgregarUsuarioComponent } from '../shared/modal-agregar-usuario/modal-agregar-usuario.component';
import { ModalEliminarUsuarioComponent } from '../shared/modal-eliminar-usuario/modal-eliminar-usuario.component';
import { ModalEditarUsuarioComponent } from '../shared/modal-editar-usuario/modal-editar-usuario.component';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';

const URL:string = 'http://localhost:3000/';

interface Usuario{
  id_usuario:string,
  carnet_usuario:string,
  nombre_usuario:string
  celular_usuario:string,
  estado_usuario: boolean,
  login_usuario:string,
  pass_usuario:string,
  id_unidad: string,
  nombre_unidad: string
}

interface respuesta{
  estado: string
}


@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit{

  displayedColumns: string[] = ['Carnet', 'Nombre', 'Celular', 'Login', 'Unidad','Estado',  'acciones'];
  dataSource = new MatTableDataSource<Usuario>();
  cargo?: string | null;
  constructor(private http: HttpClient, public dialog: MatDialog, private socket: Socket, private router: Router, private snackBar: MatSnackBar){}
  ngOnInit(): void {
    // this.solicitarVehiculos();
    this.cargo = this.getUserCargo();
    // this.socket.emit('mensajeAlServidor', { mensaje: 'Hola desde Angular' });

    // this.socket.on('mensajeDesdeServidor', (data: any) => {
    //   console.log('Mensaje recibido desde el servidor:', data);
    // });

    this.socket.on('agregarUsuario', (data: Usuario) => {
      this.dataSource.data.push(data); 
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha agregado un nuevo usuario '+data.nombre_usuario);
    });

    this.socket.on('eliminarUsuario', (data: any) => {
      let index = this.dataSource.data.findIndex( x=>{
        return x.id_usuario == data;
      });
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha elimnado un registro de usuario');
    });

    this.socket.on('editarUsuario', (data: Usuario) => {
      let index = this.dataSource.data.findIndex( x=>{
        return x.id_usuario == data.id_usuario;
      });
      this.dataSource.data.splice(index, 1);
      this.dataSource.data.push(data); 
      this.dataSource.data = [...this.dataSource.data];
      this.showAlert('Se ha actualizado los registros del usuario '+data.nombre_usuario);
    });

    this.solicitarUsuarios();
  }

  solicitarUsuarios(){
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get<Usuario[]>(URL+'api/usuario',{headers})
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
    const dialogRef = this.dialog.open(ModalAgregarUsuarioComponent, {
      width: '550px',
      data: { /* Puedes pasar datos al diálogo si es necesario */ }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);
    });
  }

  eliminarUsuario(element: any){
    // console.log(row);
    const dialogRef = this.dialog.open(ModalEliminarUsuarioComponent, {
      width: '450px',
      data:  element 
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado con resultado:', result);
    });
  }

  editarUsuario(element: any){
    // console.log(row);
    const dialogRef = this.dialog.open(ModalEditarUsuarioComponent, {
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
