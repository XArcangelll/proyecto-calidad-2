package com.proyectoIntegrador.service;

import java.util.List;

import com.proyectoIntegrador.entity.DetalleBoleta;

public interface DetalleBoletaService {

	public abstract List<DetalleBoleta> listarDetallesPorBoleta(String idBoleta);

	public abstract DetalleBoleta agregarDetalleBoleta(DetalleBoleta obj);
}
