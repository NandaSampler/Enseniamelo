package com.enseniamelo.usuarios.dto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "DTO para el rol de usuario")
public class RolDTO {

    @Schema(description = "Identificador del rol", example = "1")
    private Long id;

    @NotBlank(message = "El rol de usuario es obligatorio")
    @Size(min = 3, max = 30, message = "El rol de usuario debe tener entre 3 y 30 caracteres")
    @Schema(description = "Rol asignado al usuario", example = "USER")
    private String rolUsuario;

    @NotBlank(message = "El rol de tutor es obligatorio")
    @Size(min = 3, max = 30, message = "El rol de tutor debe tener entre 3 y 30 caracteres")
    @Schema(description = "Rol asignado al tutor", example = "TUTOR")
    private String rolTutor;

    public RolDTO() {}

    public RolDTO(Long id, String rolUsuario, String rolTutor) {
        this.id = id;
        this.rolUsuario = rolUsuario;
        this.rolTutor = rolTutor;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getRolUsuario() {
        return rolUsuario;
    }
    public void setRolUsuario(String rolUsuario) {
        this.rolUsuario = rolUsuario;
    }

    public String getRolTutor() {
        return rolTutor;
    }
    public void setRolTutor(String rolTutor) {
        this.rolTutor = rolTutor;
    }

    @Override
    public String toString() {
        return "RolDTO [id=" + id + ", rolUsuario=" + rolUsuario + ", rolTutor=" + rolTutor + "]";
    }
}
