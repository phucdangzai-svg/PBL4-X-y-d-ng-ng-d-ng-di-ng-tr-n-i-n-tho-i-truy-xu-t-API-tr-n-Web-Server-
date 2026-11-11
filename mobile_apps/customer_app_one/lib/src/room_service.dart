import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import 'models.dart';

class RoomService {
  RoomService({required this.baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  Future<List<Room>> getRooms({String? status, int? roomTypeId}) async {
    final query = <String, String>{'page': '1', 'limit': '100'};
    if (status != null) query['status'] = status;
    if (roomTypeId != null) query['room_type_id'] = '$roomTypeId';
    final json = await _get('/rooms', query);
    final rows = (json['data'] as List).cast<Map>();
    return rows
        .map((row) => Room.fromJson(Map<String, dynamic>.from(row)))
        .toList();
  }

  Future<Room> getRoom(int id) async {
    final json = await _get('/rooms/$id', {});
    return Room.fromJson(Map<String, dynamic>.from(json['data']));
  }

  Future<List<RoomType>> getRoomTypes() async {
    final json = await _get('/room-types', {});
    final rows = (json['data'] as List).cast<Map>();
    return rows
        .map((row) => RoomType.fromJson(Map<String, dynamic>.from(row)))
        .toList();
  }

  Future<Map<String, dynamic>> _get(
    String path,
    Map<String, String> query,
  ) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
    final response = await _client.get(uri);
    final json = response.body.isEmpty
        ? <String, dynamic>{}
        : Map<String, dynamic>.from(jsonDecode(response.body) as Map);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        json['message']?.toString() ?? 'Không thể tải dữ liệu phòng',
        statusCode: response.statusCode,
      );
    }
    return json;
  }

  void dispose() => _client.close();
}

class RoomListController extends ChangeNotifier {
  RoomListController(this.service);
  final RoomService service;
  List<Room> rooms = const [];
  bool loading = false;
  String? error;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      rooms = await service.getRooms();
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    service.dispose();
    super.dispose();
  }
}
