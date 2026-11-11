import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';

class CustomerService {
  CustomerService({
    required this.baseUrl,
    required this.accessToken,
    http.Client? client,
  }) : _client = client ?? http.Client();

  final String baseUrl;
  final String accessToken;
  final http.Client _client;

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _client.get(
      Uri.parse('$baseUrl/customers/me'),
      headers: {'Authorization': 'Bearer $accessToken'},
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> updateProfile({
    required String fullName,
    String? email,
    String? phone,
    String? address,
  }) async {
    final response = await _client.put(
      Uri.parse('$baseUrl/customers/me'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
      body: jsonEncode(_body(
        fullName: fullName,
        email: email,
        phone: phone,
        address: address,
      )),
    );
    return _decode(response);
  }

  Map<String, dynamic> _body({
    required String fullName,
    String? email,
    String? phone,
    String? address,
  }) =>
      {
        'full_name': fullName.trim(),
        if (email != null && email.trim().isNotEmpty) 'email': email.trim(),
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
        if (address != null && address.trim().isNotEmpty)
          'address': address.trim(),
      };

  Map<String, dynamic> _decode(http.Response response) {
    final json = response.body.isEmpty
        ? <String, dynamic>{}
        : Map<String, dynamic>.from(jsonDecode(response.body) as Map);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        json['message']?.toString() ?? 'Could not load your profile',
        statusCode: response.statusCode,
      );
    }
    return Map<String, dynamic>.from(json['data'] as Map);
  }

  void dispose() => _client.close();
}
