import json
import os


def procesar_setups(input_file, output_file):
    # Extensiones válidas categorizadas para asignarlas fácilmente
    ext_imagenes = {'.png', '.jpg', '.jpeg', '.gif'}
    ext_videos = {'.mp4', '.mov'}
    ext_audios = {'.ogg', '.mp3', '.wav'}

    todas_ext_validas = ext_imagenes | ext_videos | ext_audios

    # Cargar el JSON original
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo {input_file}")
        return

    user_map = {}

    for msg in data.get('messages', []):
        # 1. Ignorar mensajes de sistema (Pines, hilos, etc.)
        if msg.get('type') not in ['Default', 'Reply']:
            continue

        author = msg.get('author', {})
        uid = author.get('id')

        if not uid:
            continue

        # 2. Si el usuario no existe en nuestro diccionario, lo inicializamos
        if uid not in user_map:
            user_map[uid] = {
                "id": uid,
                "name": author.get('name', ''),
                "nickname": author.get('nickname') or author.get('name', ''),
                "color": author.get('color') or "#FFFFFF",
                "avatar": author.get('avatarUrl', ''),
                "content": "",
                "attachments": []
            }

        # 3. Concatenar el texto si el mensaje tiene contenido
        texto_msg = msg.get('content', '').strip()
        if texto_msg:
            if user_map[uid]['content']:
                user_map[uid]['content'] += "\n\n" + texto_msg
            else:
                user_map[uid]['content'] = texto_msg

        # 4. Filtrar y clasificar los archivos adjuntos
        for att in msg.get('attachments', []):
            filename = att.get('fileName', '')
            ext = os.path.splitext(filename)[1].lower()

            if ext in todas_ext_validas:
                media_type = 'image'
                if ext in ext_videos:
                    media_type = 'video'
                elif ext in ext_audios:
                    media_type = 'audio'

                user_map[uid]['attachments'].append({
                    "url": att.get('url'),
                    "type": media_type,
                    "fileName": filename
                })

    # 5. Filtrar el diccionario para quedarnos SOLO con los usuarios que tienen attachments
    clean_setups = [user for user in user_map.values() if len(user['attachments']) > 0]

    # Guardar el resultado en un nuevo archivo JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(clean_setups, f, indent=2, ensure_ascii=False)

    print(f"✅ Proceso completado.")
    print(f"Participantes originales en el chat: {len(user_map)}")
    print(f"Participantes válidos (con multimedia): {len(clean_setups)}")
    print(f"Archivo guardado como: {output_file}")

# Ejecutar el script usando el nombre de tu archivo
# Reemplaza 'discord_kit_...json' con el nombre exacto de tu archivo si lo renombraste
archivo_entrada = "discord_messages.json"
archivo_salida = "setups_limpios.json"

procesar_setups(archivo_entrada, archivo_salida)
