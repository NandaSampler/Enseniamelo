package com.enseniamelo.usuarios.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "DTO para el usuario")
public class UsuarioDTO {

    @Schema(description = "Identificador del usuario en la base de datos", example = "1")
    private Integer idUsuario;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 50, message = "El nombre debe tener entre 3 y 50 caracteres")
    @Schema(description = "Nombre del usuario", example = "Juan")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 3, max = 50, message = "El apellido debe tener entre 3 y 50 caracteres")
    @Schema(description = "Apellido del usuario", example = "Pérez")
    private String apellido;

    @NotNull(message = "El teléfono es obligatorio")
    @Schema(description = "Teléfono del usuario", example = "123456789")
    private Integer telefono;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe ser válido")
    @Schema(description = "Correo electrónico del usuario", example = "juan.perez@mail.com")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 50, message = "La contraseña debe tener entre 6 y 50 caracteres")
    @Schema(description = "Contraseña del usuario", example = "claveSegura123")
    private String contrasenia;

    @NotBlank(message = "El rol es obligatorio")
    @Size(max = 20, message = "El rol no puede superar los 20 caracteres")
    @Schema(description = "Rol del usuario", example = "ADMIN")
    private String rol;

    @Size(max = 100, message = "La URL de la foto no puede superar los 100 caracteres")
    @Schema(description = "URL o nombre del archivo de la foto del usuario", example = "juanperez.jpg")
    private String foto;

    // ------------------- Constructores -------------------

    public UsuarioDTO() {}

    public UsuarioDTO(Integer idUsuario, String nombre, String apellido, Integer telefono,
                      String email, String contrasenia, String rol, String foto) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.email = email;
        this.contrasenia = contrasenia;
        this.rol = rol;
        this.foto = foto;
    }

    // ------------------- Getters & Setters -------------------

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public Integer getTelefono() { return telefono; }
    public void setTelefono(Integer telefono) { this.telefono = telefono; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContrasenia() { return contrasenia; }
    public void setContrasenia(String contrasenia) { this.contrasenia = contrasenia; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }

    // ------------------- toString -------------------

    @Override
    public String toString() {
        return "UsuarioDTO [idUsuario=" + idUsuario +
                ", nombre=" + nombre +
                ", apellido=" + apellido +
                ", telefono=" + telefono +
                ", email=" + email +
                ", contrasenia=" + contrasenia +
                ", rol=" + rol +
                ", foto=" + foto +"]";
    }
}
