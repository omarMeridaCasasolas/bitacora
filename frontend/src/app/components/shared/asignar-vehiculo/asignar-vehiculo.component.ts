import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
// import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, tap } from 'rxjs/operators';

const URL:string = 'http://localhost:3000/';
interface Opciones{
  id_vehiculo: string,
  nombre: string,
  checked: boolean
}

interface Vehiculo{
  id_vehiculo: string
}

interface Chofer{
  id_chofer:string,
  carnet_chofer:string,
  nombre_chofer:string
  celular_chofer:string,
  estado_chofer:boolean,
  login_choder: string,
  pass_chofer: string
}

interface Data {
  opciones: Opciones[],
  chofer: Chofer  
}

@Component({
  selector: 'app-asignar-vehiculo',
  templateUrl: './asignar-vehiculo.component.html',
  styleUrls: ['./asignar-vehiculo.component.css']
})
export class AsignarVehiculoComponent {
  listaIdVehiculosAsignados : number[] = []; 
  checkboxItems:Opciones[]  = [];
  choferAsignado?: Chofer ;
  constructor(public dialogRef: MatDialogRef<AsignarVehiculoComponent>, private http: HttpClient, private snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public message:Data){
    this.checkboxItems = message.opciones;
    this.choferAsignado = message.chofer;
    this.vehiculosAsignadosChofer(message.chofer.id_chofer);
  }

  vehiculosAsignadosChofer(id:string){
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get<Vehiculo[]>(URL+'api/vehiculosAsignadosChofer/'+id, {headers})
        .pipe(
        tap(response  => {
            response.forEach(x => {
              for (let i = 0; i < this.checkboxItems.length; i++) {
                if(x.id_vehiculo == this.checkboxItems[i].id_vehiculo){
                  this.checkboxItems[i].checked = true;
                  this.listaIdVehiculosAsignados.push(Number.parseInt(x.id_vehiculo));
                  break;
                }
                
              }
            });
            // this.opcionesUnidad = response;
        }),
        finalize(() => {
            // Realizar acciones finales después de completar la petición
        })
        )
      .subscribe();
      }
  }

  asignarVehiculos(){
    let data = {listaVehiculoAsignados: this.listaIdVehiculosAsignados, idChofer: this.choferAsignado?.id_chofer  };
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.post<any>(URL+'api/asignarVehiculoChofer',data,{headers})
        .pipe(
          tap(response  => {
            if(response[0].estado == 'Exito'){
              this.showAlert("Se ha registrado la asignacion de vehiculo");
            }else{
              this.showAlert(response[0].estado);
            }
            this.dialogRef.close('exito');
          }),
          finalize(() => {
              // Realizar acciones finales después de completar la petición
          })
        )
      .subscribe();
    }
  }

  onCheckboxChange(event: any) {
    console.log(event.source.value);
    // console.log('Valor actual del mat-checkbox:', event.checked);
    
    // Puedes realizar acciones basadas en el valor actual del mat-checkbox
    if (event.checked) {
      // El mat-checkbox está marcado (true)
      // console.log('El mat-checkbox está marcado.');
      this.listaIdVehiculosAsignados.push(event.source.value);
    } else {
      // this.listaIdVehiculosAsignados.push(event.source.value);
      let index = this.listaIdVehiculosAsignados.findIndex( x=>{
        return x == event.source.value;
      });
      this.listaIdVehiculosAsignados.splice(index, 1);

      // El mat-checkbox está desmarcado (false)
      // console.log('El mat-checkbox está desmarcado.');
    }
  }
  
  showAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 2000, // Duración en milisegundos que se mostrará la alerta (opcional)
    });
  }
}
