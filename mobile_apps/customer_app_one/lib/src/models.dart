class AuthSession {
  const AuthSession({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });

  final Map<String, dynamic> user;
  final String accessToken;
  final String refreshToken;

  factory AuthSession.fromJson(Map<String, dynamic> json) => AuthSession(
        user: Map<String, dynamic>.from(json['user'] as Map),
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
      );
}

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

num parseNumericValue(dynamic value) {
  if (value is num) return value;
  if (value is String) {
    final parsed = num.tryParse(value);
    if (parsed != null) return parsed;
  }
  throw FormatException('Expected a numeric value, got $value');
}

class Room {
  const Room({
    required this.id,
    required this.roomNumber,
    required this.roomTypeId,
    required this.roomTypeName,
    required this.price,
    required this.status,
    this.description,
    this.imageUrl,
  });

  final int id;
  final String roomNumber;
  final int roomTypeId;
  final String roomTypeName;
  final num price;
  final String status;
  final String? description;
  final String? imageUrl;

  factory Room.fromJson(Map<String, dynamic> json) => Room(
        id: (json['id'] as num).toInt(),
        roomNumber: json['room_number'] as String,
        roomTypeId: (json['room_type_id'] as num).toInt(),
        roomTypeName: (json['room_type_name'] ?? 'Room') as String,
        price: parseNumericValue(json['price']),
        status: json['status'] as String,
        description: json['description'] as String?,
        imageUrl: json['image_url'] as String?,
      );
}

class RoomType {
  const RoomType({
    required this.id,
    required this.name,
    required this.capacity,
    this.description,
  });

  final int id;
  final String name;
  final int capacity;
  final String? description;

  factory RoomType.fromJson(Map<String, dynamic> json) => RoomType(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        capacity: (json['capacity'] as num).toInt(),
        description: json['description'] as String?,
      );
}

class Booking {
  const Booking({
    required this.id,
    required this.roomId,
    required this.roomNumber,
    required this.checkIn,
    required this.checkOut,
    required this.totalPrice,
    required this.status,
  });

  final int id;
  final int roomId;
  final String roomNumber;
  final String checkIn;
  final String checkOut;
  final num totalPrice;
  final String status;

  factory Booking.fromJson(Map<String, dynamic> json) => Booking(
        id: (json['id'] as num).toInt(),
        roomId: (json['room_id'] as num).toInt(),
        roomNumber: '${json['room_number'] ?? json['room_id']}',
        checkIn: '${json['check_in']}',
        checkOut: '${json['check_out']}',
        totalPrice: parseNumericValue(json['total_price']),
        status: '${json['status']}',
      );
}
