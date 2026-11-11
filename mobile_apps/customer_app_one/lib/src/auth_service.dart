import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

import 'models.dart';

class AuthService extends ChangeNotifier {
  AuthService({
    String? baseUrl,
    FlutterSecureStorage? storage,
    http.Client? client,
  })  : baseUrl = baseUrl ?? 'http://10.0.2.2:3000/api/v1',
        _storage = storage ?? const FlutterSecureStorage(),
        _client = client ?? http.Client();

  final String baseUrl;
  final FlutterSecureStorage _storage;
  final http.Client _client;

  AuthSession? session;
  bool isLoading = false;

  Future<bool> restoreSession() async {
    final accessToken = await _storage.read(key: 'accessToken');
    final refreshToken = await _storage.read(key: 'refreshToken');
    final userJson = await _storage.read(key: 'user');
    if (accessToken == null || refreshToken == null || userJson == null) {
      return false;
    }
    session = AuthSession(
      user: Map<String, dynamic>.from(jsonDecode(userJson) as Map),
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
    notifyListeners();
    return true;
  }

  Future<void> login(String email, String password) async {
    isLoading = true;
    notifyListeners();
    try {
      final response = await _request(
        'POST',
        '/auth/login',
        body: {'email': email.trim(), 'password': password},
      );
      final nextSession =
          AuthSession.fromJson(Map<String, dynamic>.from(response['data']));
      await _saveSession(nextSession);
      session = nextSession;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    isLoading = true;
    notifyListeners();
    try {
      await _request(
        'POST',
        '/auth/register',
        body: {
          'email': email.trim(),
          'password': password,
          'full_name': fullName.trim(),
          if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
        },
      );
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    final current = session;
    if (current != null) {
      try {
        await _request(
          'POST',
          '/auth/logout',
          token: current.accessToken,
          body: {'refreshToken': current.refreshToken},
        );
      } finally {
        await _clearSession();
      }
    }
    session = null;
    notifyListeners();
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';
    final uri = Uri.parse('$baseUrl$path');
    final response = method == 'POST'
        ? await _client.post(uri, headers: headers, body: jsonEncode(body))
        : await _client.get(uri, headers: headers);
    final decoded = response.body.isEmpty
        ? <String, dynamic>{}
        : Map<String, dynamic>.from(jsonDecode(response.body) as Map);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final errors = decoded['errors'];
      final message = errors is List ? errors.join('\n') : decoded['message'];
      throw ApiException(
        message?.toString() ?? 'Request failed',
        statusCode: response.statusCode,
      );
    }
    return decoded;
  }

  Future<void> _saveSession(AuthSession value) async {
    await _storage.write(key: 'accessToken', value: value.accessToken);
    await _storage.write(key: 'refreshToken', value: value.refreshToken);
    await _storage.write(key: 'user', value: jsonEncode(value.user));
  }

  Future<void> _clearSession() async {
    await _storage.deleteAll();
  }

  @override
  void dispose() {
    _client.close();
    super.dispose();
  }
}
