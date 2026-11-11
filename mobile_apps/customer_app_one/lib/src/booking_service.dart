import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';

class BookingService {
  BookingService({
    required this.baseUrl,
    required this.accessToken,
    http.Client? client,
  }) : _client = client ?? http.Client();

  final String baseUrl;
  final String accessToken;
  final http.Client _client;

  Future<List<Booking>> getBookings() async {
    final response = await _client.get(
      Uri.parse('$baseUrl/bookings'),
      headers: _headers,
    );
    final json = _decode(response);
    _ensureSuccess(response, json);
    return (json['data'] as List)
        .map((item) => Booking.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<Booking> createBooking({
    required int roomId,
    required DateTime checkIn,
    required DateTime checkOut,
    String? note,
  }) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/bookings'),
      headers: _headers,
      body: jsonEncode({
        'room_id': roomId,
        'check_in': _date(checkIn),
        'check_out': _date(checkOut),
        if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
      }),
    );
    final json = _decode(response);
    _ensureSuccess(response, json);
    return Booking.fromJson(Map<String, dynamic>.from(json['data']));
  }

  Future<Booking> cancelBooking(int id) async {
    final response = await _client.patch(
      Uri.parse('$baseUrl/bookings/$id/status'),
      headers: _headers,
      body: jsonEncode({'status': 'cancelled'}),
    );
    final json = _decode(response);
    _ensureSuccess(response, json);
    return Booking.fromJson(Map<String, dynamic>.from(json['data']));
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      };

  Map<String, dynamic> _decode(http.Response response) =>
      response.body.isEmpty
          ? <String, dynamic>{}
          : Map<String, dynamic>.from(jsonDecode(response.body) as Map);

  void _ensureSuccess(http.Response response, Map<String, dynamic> json) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final details = json['errors'];
      throw ApiException(
        details is List
            ? details.join('\n')
            : '${json['message'] ?? 'Booking request failed'}',
        statusCode: response.statusCode,
      );
    }
  }

  String _date(DateTime value) =>
      '${value.year.toString().padLeft(4, '0')}-'
      '${value.month.toString().padLeft(2, '0')}-'
      '${value.day.toString().padLeft(2, '0')}';

  void dispose() => _client.close();
}
