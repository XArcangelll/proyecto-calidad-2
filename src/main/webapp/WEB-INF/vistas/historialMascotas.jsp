<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c"%>
<!DOCTYPE html>
<html lang="esS">
<head>
<meta charset="UTF-8">
<meta name="viewport"
	content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />

<link rel="icon" type="image/png" href="images/logo.png">
<title>Proyecto Integrador</title>

<script type="text/javascript" src="js/core/jquery.min.js"></script>
<script type="text/javascript" src="js/bootstrap.min.js"></script>
<script type="text/javascript" src="js/bootstrapValidator.js"></script>
<script type="text/javascript" src="ckeditor/ckeditor.js"></script>

<link rel="stylesheet" href="css/estilo1.1.css" />
<link rel="stylesheet" type="text/css" href="vendor/main.css" />
<link rel="stylesheet" href="css/bootstrapValidator.css" />



</head>
<body class="">
	<div class="wrapper ">
		<jsp:include page="menuLateral.jsp" />
		<div class="main-panel">
			<jsp:include page="menuSuperior.jsp" />
			<div class="content">
				<div class="container-fluid">
					<div class="row">
						<div class="col-md-12">
							<div class="card">
								<div class="card-header card-header-primary">
									<h3 class="card-title">
										<i class="material-icons">leaderboard</i> Historial de Mascota
									</h3>
								</div>
								<div class="card-body">
									<div class="row">
										<div class="col-md-12">
											<div class="card" style="margin-top: 20px;">
												<div
													class="card-header card-header-tabs card-header-primary">
													<div class="nav-tabs-navigation">
														<div class="nav-tabs-wrapper">
															<ul class="nav nav-tabs" data-tabs="tabs">
																<c:if test="${objCargo == 'Veterinario'}">
																	<li class="nav-item"><a class="nav-link active"
																		href="#historiales" data-toggle="tab"> <i
																			class="material-icons">history_edu</i>Historial de
																			Mascotas
																	</a></li>
																	<li class="ripple-container"></li>
																	<li class="nav-item"><a class="nav-link active"
																		href="#reservas" data-toggle="tab"> <i
																			class="material-icons">book_online</i>Reservas
																	</a></li>
																</c:if>
																<c:if test="${objCargo == 'Cliente'}">
																	<li class="nav-item"><a class="nav-link active"
																		href="#historiales" data-toggle="tab"> <i
																			class="material-icons">history_edu</i>Historial de
																			Mascotas
																	</a></li>
																</c:if>
															</ul>
														</div>
													</div>
												</div>
												<div class="card-body">
													<div class="tab-content">
														<div class="tab-pane active" id="historiales">
															<c:if test="${objCargo == 'Cliente'}">
																<div class="row" style="margin: 10px 0px;">
																	<div class="col-md-9">
																		<div class="form-group" style="padding-left: 10px;">
																			<label class="bmd-label-floating">Nombre de
																				la Mascota </label> <input type="text" class="form-control"
																				id="id_nombreMascotaP">
																		</div>
																	</div>
																	<div class="col-md-1 offset-1">
																		<button onclick="buscarMascota();" type="button"
																			id="id_btnBuscar" class="btn btn-primary pull-right">Buscar</button>
																	</div>
																</div>
															</c:if>
															<table id="tablaHistoriales" class="table table-hover">
																<thead class="text-primary">
																	<tr>
																		<th style="width: 40px;">ID</th>
																		<th>Mascota</th>
																		<th>Fecha</th>
																		<th>Hora</th>
																	</tr>
																</thead>
																<tbody>
																	<c:forEach items="${historiales}" var="h">
																		<tr>
																			<td>${h.idHistorialMascota}</td>
																			<td>${h.idReserva.idMascota.nombre}</td>
																			<td>${h.fecha}</td>
																			<td>${h.hora}</td>
																		</tr>
																	</c:forEach>
																</tbody>
															</table>
															<c:if test="${historiales == null}">
																<h4>No hay historiales de tus mascotas.</h4>
															</c:if>
														</div>

														<div class="tab-pane" id="reservas">
															<table id="tablaReservas" class="table table-hover">
																<thead class="text-primary">
																	<tr>
																		<th style="width: 40px;">ID</th>
																		<th>Mascota</th>
																		<th>Fecha</th>
																		<th>Hora</th>
																	</tr>
																</thead>
																<tbody>
																	<c:forEach items="${reservas}" var="h">
																		<tr>
																			<td>${h.idReserva}</td>
																			<td>${h.idMascota.nombre}</td>
																			<td>${h.fecha}</td>
																			<td>${h.horario}</td>
																		</tr>
																	</c:forEach>
																</tbody>
															</table>
															<c:if test="${historiales == null}">
																<h4>No hay historiales de tus mascotas.</h4>
															</c:if>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal de Historial Mascota-->
		<div class="modal fade" id="idModalHistorialMascota"
			data-backdrop="static" tabindex="-1" role="dialog">
			<div class="modal-dialog" style="width: 55%;">
				<!-- Modal content-->
				<div class="modal-content">
					<div class="card">
						<div class="card-header card-header-primary">
							<h3 class="card-title">Historial</h3>
						</div>
						<div class="card-body" style="padding: 20px 18px;">
							<form accept-charset="UTF-8" id="id_formHistorialMascota">
								<div class="row">
									<input class="form-control" type="text"
										id="id_idHistorialMascota" hidden="hidden" name="idReserva">
									<div class="col-md-12">
										<div class="form-group">
											<label class="bmd-label-floating">Mascota</label> <input
												class="form-control" type="text"
												id="id_nombreMascotaHistorialMascota" readonly="readonly">
										</div>
									</div>
									<div class="col-md-12">
										<div class="form-group">
											<label class="bmd-label-floating">Fecha</label> <input
												class="form-control" type="text"
												id="id_fechaHistorialMascota" readonly="readonly">
										</div>
									</div>
									<div class="col-md-12">
										<div class="form-group">
											<label class="bmd-label-floating">Horario</label> <input
												class="form-control" type="text"
												id="id_horarioHistorialMascota" readonly="readonly">
										</div>
									</div>
									<div class="col-md-12">
										<label class="bmd-label-floating">Observacion</label>
										<textarea id="editor4" name="descripcionLarga"></textarea>
										<small id="id_mensajeDescripcionLargaConsMascota"></small>
									</div>

								</div>
								<button type="button" onclick="cerrarModalHistorialMascota();"
									class="btn btn-primary pull-right">Cerrar</button>
								<button id="id_btnRegistrarCita"
									onclick="registrarHistorialMascota();" type="button"
									class="btn btn-primary pull-right">Registrar</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>

	<!-- Modal Historial Mascota -->
	<script type="text/javascript">
		$('#id_menuHistorialMascotas').addClass('active');

		function verModalHistorialMascota(id, fecha, horario) {
			$("#id_idHistorialMascota").val(id);
			$("#id_fechaHistorialMascota").val(fecha);
			$("#id_horarioHistorialMascota").val(horario);

			$.getJSON('obtenerHtmlHistorialMascota', {
				"idHistorialMascota" : id
			}, function(data) {
				CKEDITOR.instances['editor4'].setData(data.descripcion);
				$("#id_idHistorialMascota").val(data.idHistorialMascota);
			});
			$("#id_formHistorialMascota .col-md-12 .form-group").addClass(
					"is-filled");
			$("#idModalHistorialMascota").modal("show");
		}

		function cerrarModalHistorialMascota() {
			$("#idModalHistorialMascota").modal("hide");
		}
	</script>

	<!-- Script de TextArea  -->
	<script type="text/javascript">
		$(document).ready(function() {
			modificarTextArea('editor4', 'ConsMascota');
		});
	</script>


	<script type="text/javascript">
		function editarReserva() {
			$.ajax({
				type : 'POST',
				data : {
					'idReserva' : $("#id_idReservaEditar").val(),
					'estado' : $("#id_estadoReservaEditar").val()
				},
				url : 'editarReserva',
				success : function(data) {
					if (data.CONFIRMACION == 'SI') {
						swal("��xito!", data.MENSAJE, "success");
						setTimeout(function() {
							window.location = 'trackingCliente';
						}, 1500);
					} else {
						swal("�Error!", data.MENSAJE, "error");
					}
				},
				error : function() {
					swal("�Error!", "�Comunicate con el administrador!",
							"error");
				}
			});
		}
	</script>

	<script type="text/javascript">
		$("#id_nombreMascotaP").on("keypress", function(event) {
			if (event.which == 13) {
				buscarMascota();
			}
		});

		function buscarMascota() {
			var nom = $("#id_nombreMascotaP").val();
			$("#tablaServicios tbody tr").remove();
			$
					.getJSON(
							'listarHistorialMascotaNombre',
							{
								"nombreMascotaP" : nom
							},
							function(data) {
								$
										.each(
												data,
												function(index, item) {
													$("#tablaServicios")
															.append(
																	"<tr><td>"
																			+ item.idReserva.idReserva
																			+ "</td>"
																			+ "<td>"
																			+ item.idReserva.idMascota.nombre
																			+ "</td>"
																			+ "<td>"
																			+ item.fecha
																			+ "</td>"
																			+ "<td>"
																			+ item.hora
																			+ "</td>"
																			+ "<td>"
																			+ "<button type='button' onclick=\"verModalHistorialMascota('"
																			+ item.idReserva.idReserva
																			+ "','"
																			+ item.idReserva.idMascota.nombre
																			+ "','"
																			+ item.fecha
																			+ "','"
																			+ item.hora
																			+ "');\" class='btn btn-primary'> Ver </button>"
																			+ "</td></tr>");
												});
							});
		}
	</script>

</body>
</html>