import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email!: string;
  password!: string;

  animal!: string;
  name!: string;

  constructor(private http: HttpClient, public dialog: MatDialog, private snackBar: MatSnackBar, private router: Router) {}

  onSubmit() {
    this.http.post<any>(URL_LOGIN+'api/login', {email:this.email, password: this.password})
    .pipe(
      tap(response  => {
        // console.log(response);
        if(response.token){
          this.showAlert('Exito');
          localStorage.setItem('token',response.token);
          this.router.navigate(['/reserva']);
        }else{
          this.showAlert(response.estado);
        }
        
        // this.showAlert(response.usuario.toString());
        /** 
        if(response.estado === 'Exito!!'){
          this.router.navigate(['/reserva']);
        }
        */
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
