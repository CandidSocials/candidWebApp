-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_participants;
DROP POLICY IF EXISTS "Users can join chat rooms" ON chat_participants;
DROP POLICY IF EXISTS "Users can leave chat rooms" ON chat_participants;

-- Habilitar RLS
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Crear políticas simples
CREATE POLICY "Users can manage their chat rooms"
ON chat_participants FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
