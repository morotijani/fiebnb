const prisma = require('../prismaClient');

exports.getTickets = async (req, res) => {
  try {
    const tickets = await prisma.maintenanceTicket.findMany({
      where: {
        property: {
          owner_id: req.user.id
        }
      },
      include: {
        property: true,
        room: true,
        reported_by: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching maintenance tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { property_id, room_id, title, description, type, status } = req.body;

    // Validate ownership
    const property = await prisma.property.findFirst({
      where: { id: property_id, owner_id: req.user.id }
    });

    if (!property) {
      return res.status(403).json({ error: 'Unauthorized to manage maintenance for this property' });
    }

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        property_id,
        room_id: room_id || null,
        reported_by_id: req.user.id, // Logged by the homeowner for now
        title,
        description,
        type: type || 'General',
        status: status || 'SCHEDULED'
      },
      include: {
        property: true,
        room: true,
        reported_by: true
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating maintenance ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { property_id, room_id, title, description, type, status } = req.body;

    const existingTicket = await prisma.maintenanceTicket.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!existingTicket || existingTicket.property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedTicket = await prisma.maintenanceTicket.update({
      where: { id },
      data: {
        property_id: property_id || undefined,
        room_id: room_id || (room_id === '' ? null : undefined),
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        type: type || undefined,
        status: status || undefined
      },
      include: {
        property: true,
        room: true,
        reported_by: true
      }
    });

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error updating maintenance ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTicket = await prisma.maintenanceTicket.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!existingTicket || existingTicket.property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.maintenanceTicket.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
