package com.proyectoIntegrador.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.proyectoIntegrador.entity.Boleta;
import com.proyectoIntegrador.repository.BoletaRepository;

@Service
public class BoletaServiceImpl implements BoletaService {

	@Autowired
	private BoletaRepository repository;

	@Override
	public List<Boleta> listarBoletas() {
		return repository.findAll();
	}

	@Override
	public List<Boleta> listarBoletasCliente(String idCliente) {
		return repository.listarBoletasCliente(idCliente);
	}

	@Override
	public Boleta agregarBoleta(Boleta obj) {
		return repository.save(obj);
	}
	
	
}
