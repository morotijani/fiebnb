const prisma = require('../prismaClient');


// Fetch all rooms for a specific property
exports.getRoomsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.query;
    
    if (!propertyId) {
      return res.status(400).json({ error: 'propertyId is required' });
    }

    const rooms = await prisma.room.findMany({
      where: { property_id: propertyId },
      include: {
        property: true,
        category: true
      },
      orderBy: { room_number: 'asc' }
    });

    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update room details (price and status)
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, status, room_number, images, property_id, custom_price } = req.body;

    if (id.startsWith('r')) {
      // Mock fallback
      return res.status(200).json({ message: 'Mock room updated successfully' });
    }

    const roomToUpdate = await prisma.room.findUnique({ where: { id } });
    if (!roomToUpdate) return res.status(404).json({ error: 'Room not found' });

    // Check for uniqueness if room_number is provided
    if (room_number) {
      const existing = await prisma.room.findFirst({
        where: {
          room_number,
          property_id: property_id || roomToUpdate.property_id,
          id: { not: id }
        }
      });
      if (existing) {
        return res.status(400).json({ error: 'Room name or number must be unique within this property' });
      }
    }

    const dataToUpdate = { category_id, status };
    if (room_number !== undefined) dataToUpdate.room_number = room_number;
    if (images !== undefined) dataToUpdate.images = images;
    if (property_id !== undefined) dataToUpdate.property_id = property_id;
    if (custom_price !== undefined) dataToUpdate.custom_price = custom_price ? parseFloat(custom_price) : null;

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: dataToUpdate
    });

    res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Note: For image upload, it should integrate with Cloudflare R2
// Since we have storageController.js handling generic uploads via Presigned URLs,
// we just need an endpoint here to append the image URL to the room's images array.
exports.appendRoomImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    if (id.startsWith('r')) {
      return res.status(200).json({ message: 'Mock image appended successfully', images: [imageUrl] });
    }

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const updatedImages = [...(room.images || []), imageUrl];

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: { images: updatedImages }
    });

    res.status(200).json({ message: 'Image appended successfully', images: updatedRoom.images });
  } catch (error) {
    console.error('Error appending room image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { property_id, room_number, category_id, status, custom_price } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/rooms/${f.filename}`) : [];

    // Check for uniqueness
    const existing = await prisma.room.findFirst({
      where: {
        room_number,
        property_id
      }
    });
    if (existing) {
      return res.status(400).json({ error: 'Room name or number must be unique within this property' });
    }

    const room = await prisma.room.create({
      data: {
        property_id,
        room_number,
        category_id,
        status: status || 'AVAILABLE',
        custom_price: custom_price ? parseFloat(custom_price) : null,
        images
      }
    });

    res.status(201).json({ message: 'Room created successfully', room: room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
