
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatCardModule } from '@angular/material/card'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { HttpClientModule } from '@angular/common/http';

import { BitacoraComponent } from './bitacora/bitacora.component';

import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';

import { ReactiveFormsModule } from '@angular/forms';

import { MatGridListModule } from '@angular/material/grid-list';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EditDialogComponent } from './components/shared/edit-dialog/edit-dialog.component';


import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule , MAT_DATE_LOCALE } from '@angular/material/core'; 
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { VehiculoComponent } from './components/vehiculo/vehiculo.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { ModalAgregarVehiculoComponent } from './components/shared/modal-agregar-vehiculo/modal-agregar-vehiculo.component';
import { ModalEliminarVehiculoComponent } from './components/shared/modal-eliminar-vehiculo/modal-eliminar-vehiculo.component';

import {MatCheckboxModule} from '@angular/material/checkbox';
import { ModalEditarVehiculoComponent } from './components/shared/modal-editar-vehiculo/modal-editar-vehiculo.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { ModalAgregarUsuarioComponent } from './components/shared/modal-agregar-usuario/modal-agregar-usuario.component';
import { ModalEliminarUsuarioComponent } from './components/shared/modal-eliminar-usuario/modal-eliminar-usuario.component';
import { ModalEditarUsuarioComponent } from './components/shared/modal-editar-usuario/modal-editar-usuario.component';
import { ChoferComponent } from './components/chofer/chofer.component';

import {FlexLayoutModule} from '@angular/flex-layout';
import { ModalAgregarChoferComponent } from './components/shared/modal-agregar-chofer/modal-agregar-chofer.component';
import { ModalEditarChoferComponent } from './components/shared/modal-editar-chofer/modal-editar-chofer.component';
import { ModalEliminarChoferComponent } from './components/shared/modal-eliminar-chofer/modal-eliminar-chofer.component';
import { UnidadComponent } from './components/unidad/unidad.component';
import { ModalAgregarUnidadComponent } from './components/shared/modal-agregar-unidad/modal-agregar-unidad.component';
import { ModalEliminarUnidadComponent } from './components/shared/modal-eliminar-unidad/modal-eliminar-unidad.component';
import { ModalEditarUnidadComponent } from './components/shared/modal-editar-unidad/modal-editar-unidad.component';
import { NavchoferComponent } from './components/navbar/navchofer/navchofer.component';
import { NavUsuarioComponent } from './components/navbar/nav-usuario/nav-usuario.component';
import { loginGuard } from './guards/login.guard';
import { AsignarVehiculoComponent } from './components/shared/asignar-vehiculo/asignar-vehiculo.component';


const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

const routes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '', component: LoginComponent },
  { path: 'reserva', component: BitacoraComponent, canActivate: [loginGuard] },
  { path: 'usuario', component: UsuarioComponent },
  { path: 'vehiculo', component: VehiculoComponent },
  { path: 'chofer', component: ChoferComponent },
  { path: 'unidad', component: UnidadComponent, canActivate: [loginGuard] }
];


@NgModule({
  declarations: [
    AppComponent,
    BitacoraComponent,
    ConfirmDialogComponent,
    EditDialogComponent,
    LoginComponent,
    VehiculoComponent,
    ModalAgregarVehiculoComponent,
    ModalEliminarVehiculoComponent,
    ModalEditarVehiculoComponent,
    UsuarioComponent,
    ModalAgregarUsuarioComponent,
    ModalEliminarUsuarioComponent,
    ModalEditarUsuarioComponent,
    ChoferComponent,
    ModalAgregarChoferComponent,
    ModalEditarChoferComponent,
    ModalEliminarChoferComponent,
    UnidadComponent,
    ModalAgregarUnidadComponent,
    ModalEliminarUnidadComponent,
    ModalEditarUnidadComponent,
    NavchoferComponent,
    NavUsuarioComponent,
    AsignarVehiculoComponent
  ],
  imports: [
    BrowserAnimationsModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    BrowserModule,
    FormsModule,
    MatInputModule,
    HttpClientModule,
    MatDialogModule,
    MatSelectModule, 
    ReactiveFormsModule,
    MatGridListModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatCheckboxModule,
    FlexLayoutModule,
    SocketIoModule.forRoot(config),
    RouterModule.forRoot(routes)
  ],
  // entryComponents: [ConfirmDialogComponent],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-ES' } ],
  bootstrap: [AppComponent]
})
export class AppModule { }

