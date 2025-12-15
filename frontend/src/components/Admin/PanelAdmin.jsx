// frontend/src/components/Admin/PanelAdmin.jsx - VERSIÓN ACTUALIZADA
import { useState } from "react";
import "../../styles/Admin/adminPanel.css";
import PlanesAdmin from "../Pagos/PlanesAdmin";
import GestionUsuarios from "./GestionUsuarios";
import GestionCursos from "./GestionCursos";
import SolicitudesTutores from "./SolicitudesTutores";

const PanelAdmin = () => {
  const [activeTab, setActiveTab] = useState("solicitudes");

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-container">
        <section className="admin-panel-hero">
          <div className="admin-panel-hero-overlay" />
          <div className="admin-panel-hero-content">
            <div>
              <h1 className="admin-panel-title">Panel de administración</h1>
              <p className="admin-panel-subtitle">
                Administra solicitudes, usuarios, cursos y planes de suscripción del sistema.
              </p>
            </div>
            <div className="admin-panel-hero-buttons">
              <button
                type="button"
                className={
                  "admin-panel-tabbtn " +
                  (activeTab === "solicitudes"
                    ? "admin-panel-tabbtn-active"
                    : "admin-panel-tabbtn-inactive")
                }
                onClick={() => setActiveTab("solicitudes")}
              >
                <span className="admin-panel-tabbtn-dot" />
                Solicitudes
              </button>

              <button
                type="button"
                className={
                  "admin-panel-tabbtn " +
                  (activeTab === "usuarios"
                    ? "admin-panel-tabbtn-active"
                    : "admin-panel-tabbtn-inactive")
                }
                onClick={() => setActiveTab("usuarios")}
              >
                <span className="admin-panel-tabbtn-dot" />
                Usuarios
              </button>

              <button
                type="button"
                className={
                  "admin-panel-tabbtn " +
                  (activeTab === "cursos"
                    ? "admin-panel-tabbtn-active"
                    : "admin-panel-tabbtn-inactive")
                }
                onClick={() => setActiveTab("cursos")}
              >
                <span className="admin-panel-tabbtn-dot" />
                Cursos
              </button>

              <button
                type="button"
                className={
                  "admin-panel-tabbtn " +
                  (activeTab === "planes"
                    ? "admin-panel-tabbtn-active"
                    : "admin-panel-tabbtn-inactive")
                }
                onClick={() => setActiveTab("planes")}
              >
                <span className="admin-panel-tabbtn-dot" />
                Planes
              </button>
            </div>
          </div>
          <div className="admin-panel-hero-graphic" />
        </section>

        <section className="admin-panel-list">
          {activeTab === "solicitudes" && <SolicitudesTutores />}
          {activeTab === "usuarios" && <GestionUsuarios />}
          {activeTab === "cursos" && <GestionCursos />}
          {activeTab === "planes" && <PlanesAdmin />}
        </section>
      </div>
    </div>
  );
};

export default PanelAdmin;