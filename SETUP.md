# Configuración del Proyecto - Ferretería App

## Requisitos Previos

- Node.js 18+ instalado
- Una cuenta de Supabase (gratis en <https://supabase.com>)

## Pasos de Instalación

### 1. Clonar e Instalar Dependencias

\`\`\`bash
npm install

# o

pnpm install

# o

yarn install
\`\`\`

### 2. Configurar Variables de Entorno

1. Ve a tu proyecto en Supabase: <https://supabase.com/dashboard>
2. En tu proyecto, ve a **Settings → API**
3. Copia las credenciales que necesitas:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

4. Crea un archivo `.env.local` en la raíz del proyecto (copia `.env.local.example`):

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=<https://tu-proyecto.supabase.co>
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=<http://localhost:3000/auth/callback>
\`\`\`

### 3. La Base de Datos Ya Está Lista

Las tablas ya fueron creadas en tu base de datos Supabase con:

- ✅ 9 tablas (productos, ventas, compras, proveedores, clientes, categorías, etc.)
- ✅ Políticas RLS configuradas para seguridad
- ✅ Triggers automáticos para actualizar inventario
- ✅ Datos semilla con 7 categorías de productos

### 4. Ejecutar el Proyecto

\`\`\`bash
npm run dev

# o

pnpm dev

# o

yarn dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Crear tu Primera Cuenta

1. Ve a <http://localhost:3000>
2. Haz clic en "Comenzar Ahora" o "Iniciar Sesión"
3. Luego haz clic en "Regístrate aquí"
4. Crea tu cuenta con email y contraseña
5. **Importante:** Revisa tu email para confirmar tu cuenta
6. Después de confirmar, inicia sesión y accede al dashboard

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── auth/              # Autenticación (login, registro)
│   ├── dashboard/         # Sistema completo de gestión
│   │   ├── inventory/     # Gestión de productos e inventario
│   │   ├── sales/         # Registro de ventas
│   │   ├── purchases/     # Órdenes de compra
│   │   ├── suppliers/     # Gestión de proveedores
│   │   └── customers/     # Gestión de clientes
├── components/            # Componentes reutilizables
├── lib/supabase/         # Clientes de Supabase
└── scripts/              # Scripts SQL (ya ejecutados)
\`\`\`

## Funcionalidades Principales

### 📦 Gestión de Inventario

- Agregar, editar y eliminar productos
- Control de stock con alertas de nivel mínimo
- Categorización de productos
- Seguimiento de precios de costo y venta

### 💰 Ventas y Pedidos

- Registro de ventas con múltiples productos
- Gestión de clientes
- Diferentes métodos de pago
- Historial completo de ventas

### 🚚 Compras y Proveedores

- Gestión de proveedores
- Creación de órdenes de compra
- Seguimiento de estados (pendiente, recibido)
- Actualización automática de inventario al recibir órdenes

### 📊 Dashboard

- Estadísticas en tiempo real
- Alertas de productos con stock bajo
- Resumen de ventas y compras
- Navegación intuitiva

## Solución de Problemas

### Error: "Your project's URL and Key are required"

- Verifica que el archivo `.env.local` exista en la raíz del proyecto
- Asegúrate de que las variables tengan los valores correctos de tu proyecto Supabase
- Reinicia el servidor de desarrollo después de crear/modificar `.env.local`

### No puedo iniciar sesión

- Verifica que hayas confirmado tu email
- Revisa la bandeja de spam si no recibiste el email de confirmación
- Asegúrate de que las credenciales de Supabase sean correctas

### La base de datos está vacía

- Las tablas ya deberían estar creadas automáticamente
- Si necesitas recrearlas, los scripts están en `/scripts`
- Puedes ejecutarlos desde el editor SQL de Supabase

## Soporte

Para más información sobre las tecnologías utilizadas:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
