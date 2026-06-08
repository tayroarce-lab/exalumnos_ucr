-- Función que ejecuta el borrado lógico en cascada
CREATE OR REPLACE FUNCTION soft_delete_cascade()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar si el registro acaba de ser "borrado lógicamente" (UPDATE)
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        
        -- Si borraste un Usuario (sea estudiante o exalumno)
        IF TG_TABLE_NAME = 'users' THEN
            UPDATE posiciones SET deleted_at = NEW.deleted_at WHERE exalumno_id = NEW.id;
            UPDATE matches SET deleted_at = NEW.deleted_at WHERE exalumno_id = NEW.id OR estudiante_id = NEW.id;
            UPDATE donaciones SET deleted_at = NEW.deleted_at WHERE exalumno_id = NEW.id OR proyecto_estudiante_id = NEW.id;
        END IF;

        -- Si borraste una Posición (ej. una oferta de mentoría/trabajo)
        IF TG_TABLE_NAME = 'posiciones' THEN
            -- UPDATE aplicaciones SET deleted_at = NEW.deleted_at WHERE posicion_id = NEW.id;
            UPDATE matches SET deleted_at = NEW.deleted_at WHERE posicion_id = NEW.id;
        END IF;

    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vincular el Trigger a la tabla 'users'
DROP TRIGGER IF EXISTS trigger_soft_delete_users ON users;
CREATE TRIGGER trigger_soft_delete_users
AFTER UPDATE OF deleted_at ON users
FOR EACH ROW
EXECUTE FUNCTION soft_delete_cascade();

-- Vincular el Trigger a la tabla 'posiciones'
DROP TRIGGER IF EXISTS trigger_soft_delete_posiciones ON posiciones;
CREATE TRIGGER trigger_soft_delete_posiciones
AFTER UPDATE OF deleted_at ON posiciones
FOR EACH ROW
EXECUTE FUNCTION soft_delete_cascade();
