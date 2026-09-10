import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const client = () =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

// Set stores a key-value pair in the database.
const kvSet = async (key: string, value: any): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from('kv_store_1cd2eafa').upsert({ key, value });
  if (error) throw new Error(error.message);
};

// Get retrieves a key-value pair from the database.
const kvGet = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase
    .from('kv_store_1cd2eafa')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.value;
};

// Search for key-value pairs by prefix.
const kvGetByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase
    .from('kv_store_1cd2eafa')
    .select('key, value')
    .like('key', prefix + '%');
  if (error) throw new Error(error.message);
  return data?.map((d) => d.value) ?? [];
};

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Health check
app.get('/make-server-1cd2eafa/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== REPORTS =====

// Get all reports
app.get('/make-server-1cd2eafa/reports', async (c) => {
  try {
    const reports = await kvGetByPrefix('report:');
    return c.json({ reports: reports || [] });
  } catch (error) {
    console.log('Error fetching reports:', error);
    return c.json({ error: 'Failed to fetch reports' }, 500);
  }
});

// Submit a new report
app.post('/make-server-1cd2eafa/reports', async (c) => {
  try {
    const body = await c.req.json();
    const reportId = `report:${Date.now()}`;

    const report = {
      id: reportId,
      type: body.type,
      location: body.location,
      description: body.description,
      isAnonymous: body.isAnonymous,
      name: body.name || null,
      phone: body.phone || null,
      email: body.email || null,
      status: 'pending',
      trackingNumber: Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    await kvSet(reportId, report);

    return c.json({
      success: true,
      trackingNumber: report.trackingNumber,
      message: 'Report submitted successfully',
    });
  } catch (error) {
    console.log('Error submitting report:', error);
    return c.json({ error: 'Failed to submit report' }, 500);
  }
});

// ===== ALERTS =====

// Get all alerts
app.get('/make-server-1cd2eafa/alerts', async (c) => {
  try {
    const alerts = await kvGetByPrefix('alert:');
    const sortedAlerts = (alerts || []).sort(
      (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return c.json({ alerts: sortedAlerts });
  } catch (error) {
    console.log('Error fetching alerts:', error);
    return c.json({ error: 'Failed to fetch alerts' }, 500);
  }
});

// Create a new alert (admin only - in production would require auth)
app.post('/make-server-1cd2eafa/alerts', async (c) => {
  try {
    const body = await c.req.json();
    const alertId = `alert:${Date.now()}`;

    const alert = {
      id: alertId,
      type: body.type,
      title: body.title,
      description: body.description,
      location: body.location,
      distance: body.distance,
      timestamp: new Date().toISOString(),
    };

    await kvSet(alertId, alert);

    return c.json({ success: true, alert });
  } catch (error) {
    console.log('Error creating alert:', error);
    return c.json({ error: 'Failed to create alert' }, 500);
  }
});

// ===== SURVEYS =====

// Get all surveys
app.get('/make-server-1cd2eafa/surveys', async (c) => {
  try {
    const surveys = await kvGetByPrefix('survey:');
    return c.json({ surveys: surveys || [] });
  } catch (error) {
    console.log('Error fetching surveys:', error);
    return c.json({ error: 'Failed to fetch surveys' }, 500);
  }
});

// Submit survey response
app.post('/make-server-1cd2eafa/survey-responses', async (c) => {
  try {
    const body = await c.req.json();
    const responseId = `survey-response:${body.surveyId}:${Date.now()}`;

    const response = {
      id: responseId,
      surveyId: body.surveyId,
      answer: body.answer,
      timestamp: new Date().toISOString(),
    };

    await kvSet(responseId, response);

    return c.json({ success: true, message: 'Response submitted successfully' });
  } catch (error) {
    console.log('Error submitting survey response:', error);
    return c.json({ error: 'Failed to submit response' }, 500);
  }
});

// ===== CHAT =====

// Get chat messages
app.get('/make-server-1cd2eafa/chat-messages', async (c) => {
  try {
    const messages = await kvGetByPrefix('chat:');
    const sortedMessages = (messages || []).sort(
      (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.log('Error fetching chat messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Send chat message
app.post('/make-server-1cd2eafa/chat-messages', async (c) => {
  try {
    const body = await c.req.json();
    const messageId = `chat:${Date.now()}`;

    const message = {
      id: messageId,
      sender: body.sender,
      text: body.text,
      timestamp: new Date().toISOString(),
    };

    await kvSet(messageId, message);

    // Auto-response from police (simulation)
    if (body.sender === 'user') {
      const autoResponses = [
        '¿Puedes proporcionar más detalles sobre la ubicación?',
        'Gracias por tu reporte. Un oficial revisará esta información.',
        '¿Hay algún peligro inmediato en este momento?',
        'Hemos registrado tu consulta. ¿Hay algo más que quieras agregar?',
        'Entendido. ¿Puedes describir a las personas involucradas?',
      ];

      setTimeout(async () => {
        const policeMessageId = `chat:${Date.now() + 1}`;
        const policeMessage = {
          id: policeMessageId,
          sender: 'police',
          text: autoResponses[Math.floor(Math.random() * autoResponses.length)],
          timestamp: new Date().toISOString(),
        };
        await kvSet(policeMessageId, policeMessage);
      }, 1500);
    }

    return c.json({ success: true, message });
  } catch (error) {
    console.log('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Initialize some sample data
app.post('/make-server-1cd2eafa/init-data', async (c) => {
  try {
    const surveys = [
      {
        id: 'survey:1',
        title: '¿Te sientes seguro en tu vecindario?',
        description: 'Tu opinión nos ayuda a mejorar la seguridad en la comunidad',
        type: 'rating',
      },
      {
        id: 'survey:2',
        title: '¿Has notado aumento de patrullaje policial?',
        description: 'Queremos saber si nuestras medidas de seguridad son visibles',
        type: 'yesno',
      },
      {
        id: 'survey:3',
        title: '¿Qué tipo de seguridad te preocupa más?',
        description: 'Ayúdanos a priorizar nuestros esfuerzos',
        type: 'multiple',
        options: [
          'Robos residenciales',
          'Asaltos en la calle',
          'Vandalismo',
          'Tráfico de drogas',
          'Violencia doméstica',
        ],
      },
    ];

    for (const survey of surveys) {
      await kvSet(survey.id, survey);
    }

    const alerts = [
      {
        id: 'alert:1',
        type: 'high',
        title: 'Actividad sospechosa reportada',
        description:
          'Varios ciudadanos reportaron movimientos inusuales cerca del parque central. Patrulla policial en camino.',
        location: 'Parque Central',
        distance: '0.5 km',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: 'alert:2',
        type: 'medium',
        title: 'Vehículo abandonado',
        description:
          'Se ha identificado un vehículo abandonado en la zona. Las autoridades están verificando.',
        location: 'Calle Principal #234',
        distance: '1.2 km',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    for (const alert of alerts) {
      await kvSet(alert.id, alert);
    }

    const welcomeMessage = {
      id: 'chat:1',
      sender: 'police',
      text: '¡Hola! Bienvenido al chat de seguridad ciudadana. ¿En qué podemos ayudarte hoy?',
      timestamp: new Date(Date.now() - 60000).toISOString(),
    };
    await kvSet(welcomeMessage.id, welcomeMessage);

    return c.json({ success: true, message: 'Sample data initialized' });
  } catch (error) {
    console.log('Error initializing data:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

Deno.serve(app.fetch);
