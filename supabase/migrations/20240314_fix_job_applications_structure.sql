-- Hacer que la columna proposal sea nullable
ALTER TABLE job_applications ALTER COLUMN proposal DROP NOT NULL;

-- Eliminar la vista existente primero
DROP VIEW IF EXISTS chat_rooms_with_participants;

-- Crear la vista desde cero
CREATE VIEW chat_rooms_with_participants AS
SELECT 
    cr.id,
    cr.name,
    cr.type,
    cr.job_application_id,
    cr.job_id,
    cr.created_by,
    cr.created_at,
    cr.updated_at,
    array_agg(
        json_build_object(
            'user_id', cp.user_id,
            'joined_at', cp.joined_at,
            'last_read_at', cp.last_read_at
        )
    ) as participants
FROM chat_rooms cr
JOIN chat_participants cp ON cr.id = cp.room_id
GROUP BY cr.id, cr.name, cr.type, cr.job_application_id, cr.job_id, cr.created_by, cr.created_at, cr.updated_at;
