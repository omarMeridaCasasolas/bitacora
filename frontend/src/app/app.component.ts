import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

// import {MatDialog, MatDialogConfig} from "@angular/material";

const URL_LOGIN:string = 'http://localhost:3000/';
export interface DialogData {
  animal: string;
  name: string;
}

export interface respuestaa{
  estado: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  email!: string;
  password!: string;

  animal!: string;
  name!: string;

  constructor(private http: HttpClient, public dialog: MatDialog, private snackBar: MatSnackBar, private router: Router, private socket: Socket) {}
  
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    // this.socket.emit('mensajeAlServidor', { mensaje: 'Hola desde Angular' });

    // this.socket.on('mensajeDesdeServidor', (data: any) => {
    //   console.log('Mensaje recibido desde el servidor:', data);
    // });
  }

  onSubmit() {
    this.http.post<respuestaa>(URL_LOGIN+'api/login', {email:this.email, password: this.password})
    .pipe(
      tap(response  => {
        console.log(response);
        this.showAlert(response.estado.toString());
        if(response.estado === 'Exito!!'){
          this.router.navigate(['/reserva']);
        }
        // this.openDialog();
      }),
      finalize(() => {
        // Realizar acciones finales después de completar la petición
      })
    )
    .subscribe();
  }

  // openDialog():void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent,{
  //     width:'350px',
  //     data: 'Estas Seguro'
  //   });
  //   dialogRef.afterClosed().subscribe(res => {
  //     console.log(res);
  //   });
  // }

  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}