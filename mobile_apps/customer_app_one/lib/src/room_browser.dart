import 'package:flutter/material.dart';

import 'models.dart';
import 'booking_service.dart';
import 'room_service.dart';

class RoomBrowser extends StatefulWidget {
  const RoomBrowser({
    super.key,
    required this.baseUrl,
    required this.title,
    this.accent = Colors.teal,
    this.accessToken,
  });

  final String baseUrl;
  final String title;
  final Color accent;
  final String? accessToken;

  @override
  State<RoomBrowser> createState() => _RoomBrowserState();
}

class _RoomBrowserState extends State<RoomBrowser> {
  late final RoomListController controller;

  @override
  void initState() {
    super.initState();
    controller = RoomListController(RoomService(baseUrl: widget.baseUrl))..load();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: controller,
        builder: (context, _) {
          if (controller.loading && controller.rooms.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          if (controller.error != null && controller.rooms.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(controller.error!),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: controller.load,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          if (controller.rooms.isEmpty) {
            return const Center(child: Text('No available rooms found.'));
          }
          return RefreshIndicator(
            onRefresh: controller.load,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(widget.title,
                    style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 12),
                for (final room in controller.rooms)
                  _RoomCard(
                    room: room,
                    accent: widget.accent,
                    onTap: widget.accessToken == null
                        ? null
                        : () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => RoomDetailPage(
                                  room: room,
                                  baseUrl: widget.baseUrl,
                                  accessToken: widget.accessToken!,
                                  accent: widget.accent,
                                ),
                              ),
                            ),
                  ),
              ],
            ),
          );
        },
      );

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}

class _RoomCard extends StatelessWidget {
  const _RoomCard({
    required this.room,
    required this.accent,
    this.onTap,
  });
  final Room room;
  final Color accent;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Card(
        margin: const EdgeInsets.only(bottom: 14),
        child: ListTile(
          onTap: onTap,
          leading: CircleAvatar(
            backgroundColor: accent.withValues(alpha: .15),
            child: Icon(Icons.hotel, color: accent),
          ),
          title: Text('${room.roomTypeName} - Room ${room.roomNumber}'),
          subtitle: Text(
            '${room.price.toStringAsFixed(0)} / night\n'
            '${room.description ?? 'Comfortable hotel room'}',
          ),
          isThreeLine: true,
        ),
      );
}

class RoomDetailPage extends StatefulWidget {
  const RoomDetailPage({
    super.key,
    required this.room,
    required this.baseUrl,
    required this.accessToken,
    required this.accent,
  });

  final Room room;
  final String baseUrl;
  final String accessToken;
  final Color accent;

  @override
  State<RoomDetailPage> createState() => _RoomDetailPageState();
}

class _RoomDetailPageState extends State<RoomDetailPage> {
  DateTime? checkIn;
  DateTime? checkOut;
  bool loading = false;
  String? error;

  Future<void> _pick(bool isCheckIn) async {
    final selected = await showDatePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 730)),
      initialDate: isCheckIn
          ? DateTime.now().add(const Duration(days: 1))
          : (checkIn ?? DateTime.now()).add(const Duration(days: 2)),
    );
    if (selected == null) return;
    setState(() {
      if (isCheckIn) {
        checkIn = selected;
        if (checkOut != null && !checkOut!.isAfter(selected)) checkOut = null;
      } else {
        checkOut = selected;
      }
    });
  }

  Future<void> _book() async {
    if (checkIn == null || checkOut == null) {
      setState(() => error = 'Please select check-in and check-out dates.');
      return;
    }
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final booking = await BookingService(
        baseUrl: widget.baseUrl,
        accessToken: widget.accessToken,
      ).createBooking(
        roomId: widget.room.id,
        checkIn: checkIn!,
        checkOut: checkOut!,
      );
      if (mounted) {
        await showDialog<void>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Booking created'),
            content: Text('Booking #${booking.id} is ${booking.status}.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Done'),
              ),
            ],
          ),
        );
      }
    } on ApiException catch (exception) {
      setState(() => error = exception.message);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  String _format(DateTime? date) =>
      date == null ? 'Select date' : '${date.day}/${date.month}/${date.year}';

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(widget.room.roomTypeName)),
        body: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            CircleAvatar(
              radius: 42,
              backgroundColor: widget.accent.withValues(alpha: .15),
              child: Icon(Icons.hotel, size: 44, color: widget.accent),
            ),
            const SizedBox(height: 16),
            Text(
              'Room ${widget.room.roomNumber}',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            Text('${widget.room.price.toStringAsFixed(0)} per night'),
            const SizedBox(height: 8),
            Text(widget.room.description ?? 'A comfortable room for your stay.'),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () => _pick(true),
              icon: const Icon(Icons.login),
              label: Text('Check-in: ${_format(checkIn)}'),
            ),
            OutlinedButton.icon(
              onPressed: checkIn == null ? null : () => _pick(false),
              icon: const Icon(Icons.logout),
              label: Text('Check-out: ${_format(checkOut)}'),
            ),
            if (error != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ),
            const SizedBox(height: 18),
            FilledButton(
              onPressed: loading ? null : _book,
              child: loading
                  ? const CircularProgressIndicator()
                  : const Text('Request booking'),
            ),
          ],
        ),
      );
}
