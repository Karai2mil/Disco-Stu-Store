import React, { Component } from "react";
import { Link } from "react-router-dom";

export const Footer = () => (
	<div className="layout" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
		<div className="content" style={{ height: '10vh', flex: '1' }}></div>
		<div className="footer" style={{ flexShrink: 0 }}>
			<footer className="container-fluid bg-black text-white">
				<div className="d-flex p-3">
					<p className="col-md-4 ms-3 mb-0 text-muted flex-fill fs-6 d-flex" style={{ color: 'white' }}>
						<span className="fs-3 text-white">Disco Stu</span><span style={{ color: 'white', padding: '13px 0px 0px 5px' }}>© 2023 Company,
						Inc</span>
					</p>

					<ul className="nav col-md-4 d-flex align-items-center justify-content-end mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
						<li className="nav-item">
							<Link to="" className="nav-link px-2 text-muted">
								<p style={{ color: 'white' }}>Inicio</p>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/about" className="nav-link px-2 text-muted">
								<p style={{ color: 'white' }}>Acerca</p>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/explorer" className="nav-link px-2 text-muted">
								<p style={{ color: 'white' }}>Explorar</p>
							</Link>
						</li>
					</ul>
				</div>
			</footer>
		</div>
	</div>
);
