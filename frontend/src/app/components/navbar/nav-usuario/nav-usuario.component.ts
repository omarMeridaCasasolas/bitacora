import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, tap } from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode';

const URL:string = 'http://localhost:3000/';

interface respuesta{
  estado: string
}

@Component({
  selector: 'app-nav-usuario',
  templateUrl: './nav-usuario.component.html',
  styleUrls: ['./nav-usuario.component.css']
})
export class NavUsuarioComponent {
  username?: string | null;
  constructor(private http: HttpClient, private router: Router){
    this.username = this.getUsername();
  }
  logout(){
    this.http.get<respuesta>(URL+'logout')
    .pipe(
        tap(response  => {
            // Manejar la respuesta exitosaimport { tap, finalize } from 'rxjs/operators';
            // console.log(response);
            if(response.estado == "exito"){
                localStorage.removeItem('token');
                localStorage.clear();
                this.router.navigate(['/']);
            }else{
                
            }
        }),
        finalize(() => {
            // Realizar acciones finales después de completar la petición
        })
    )
    .subscribe();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getDecodedToken(): any {
  const token = this.getToken();
  return token ? jwtDecode(token) : null;
  }

  getUsername(): string | null {
      const decodedToken = this.getDecodedToken();
      // console.log(decodedToken);
      return decodedToken ? decodedToken.usuario : null;
  }
}
