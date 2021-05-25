package com.proyectoIntegrador.controller;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.proyectoIntegrador.entity.Boleta;
import com.proyectoIntegrador.entity.Cliente;
import com.proyectoIntegrador.entity.Distrito;
import com.proyectoIntegrador.entity.Reserva;
import com.proyectoIntegrador.service.BoletaService;
import com.proyectoIntegrador.service.ReservaService;

@Controller
public class redireccionesController {

	@Autowired
	private BoletaService serviceBoleta;

	@Autowired
	private ReservaService serviceReserva;

	@RequestMapping("/error403")
	public String error403() {
		return "error403";
	}

	@RequestMapping("/error404")
	public String error404() {
		return "error404";
	}

	@RequestMapping("/principal")
	public String principal() {
		return "principal";
	}

	@RequestMapping("/nosotros")
	public String nosotros() {
		return "nosotros";
	}

	@RequestMapping("/trackingCliente")
	public String trackingCliente(HttpServletRequest request, Model model) {
		HttpSession session = request.getSession(true);
		if (session.getAttribute("objCargo") != null) {
			if (!session.getAttribute("objCargo").equals("Cliente")) {
				return "redirect:error403";
			} else {
				int idCliente = Integer.parseInt(session.getAttribute("objIdCliente").toString());
				List<Boleta> listaPedidos = serviceBoleta.listarBoletasCliente(idCliente);
				if (listaPedidos.isEmpty())
					model.addAttribute("pedidos", null);
				else if (!listaPedidos.isEmpty())
					model.addAttribute("pedidos", listaPedidos);
				List<Reserva> listaServicios = serviceReserva.listarReservasCliente(idCliente);
				if (listaServicios.isEmpty())
					model.addAttribute("servicios", null);
				else if (!listaServicios.isEmpty())
					model.addAttribute("servicios", listaServicios);
				return "trackingCliente";
			}
		}
		return "redirect:error403";
	}
}
