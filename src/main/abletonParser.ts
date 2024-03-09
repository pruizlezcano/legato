/* eslint-disable no-restricted-syntax */
import zlib from 'zlib';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import { Track } from '../interfaces/Track';

// eslint-disable-next-line import/prefer-default-export
export class AbletonParser {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public parse(this: AbletonParser): {
    version: string;
    bpm: number;
    audioTracks: Track[];
    midiTracks: Track[];
    returnTracks: Track[];
  } {
    const zippedContent = fs.readFileSync(this.filePath);
    const content = zlib.gunzipSync(zippedContent).toString('utf-8');

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    const jObj = parser.parse(content);
    const version = jObj?.Ableton?.Creator;
    let bpm;
    if (version.includes('Ableton Live 12')) {
      bpm = parseFloat(
        jObj?.Ableton?.LiveSet?.MainTrack?.DeviceChain?.Mixer?.Tempo?.Manual
          ?.Value,
      );
    } else {
      bpm = parseFloat(
        jObj?.Ableton?.LiveSet?.MasterTrack?.DeviceChain?.Mixer?.Tempo?.Manual
          ?.Value,
      );
    }

    const audioTracks: Track[] = Array.isArray(
      jObj?.Ableton?.LiveSet?.Tracks?.AudioTrack,
    )
      ? jObj?.Ableton?.LiveSet?.Tracks?.AudioTrack.map((track: any) => {
          return { type: 'audio', ...this.parseTrack(track) };
        })
      : jObj?.Ableton?.LiveSet?.Tracks?.AudioTrack
        ? [
            {
              type: 'audio',
              ...this.parseTrack(jObj?.Ableton?.LiveSet?.Tracks?.AudioTrack),
            },
          ]
        : [];

    const midiTracks: Track[] = Array.isArray(
      jObj?.Ableton?.LiveSet?.Tracks?.MidiTrack,
    )
      ? jObj?.Ableton?.LiveSet?.Tracks?.MidiTrack.map((track: any) => {
          return { type: 'midi', ...this.parseTrack(track) };
        })
      : jObj?.Ableton?.LiveSet?.Tracks?.MidiTrack
        ? [
            {
              type: 'midi',
              ...this.parseTrack(jObj?.Ableton?.LiveSet?.Tracks?.MidiTrack),
            },
          ]
        : [];

    const returnTracks: Track[] = Array.isArray(
      jObj?.Ableton?.LiveSet?.Tracks?.ReturnTrack,
    )
      ? jObj?.Ableton?.LiveSet?.Tracks?.ReturnTrack.map((track: any) => {
          return { type: 'return', ...this.parseTrack(track) };
        })
      : jObj?.Ableton?.LiveSet?.Tracks?.ReturnTrack
        ? [
            {
              type: 'return',
              ...this.parseTrack(jObj?.Ableton?.LiveSet?.Tracks?.ReturnTrack),
            },
          ]
        : [];

    return { version, bpm, audioTracks, midiTracks, returnTracks };
  }

  private parseTrack(track: any): { name: string; pluginNames: string[] } {
    const name = track.Name.EffectiveName.Value;
    const deviceChain = track.DeviceChain.DeviceChain.Devices;
    const pluginNames = this.parseDeviceChain(deviceChain);

    return {
      name,
      pluginNames,
    };
  }

  private parseDeviceChain(deviceChain: any): string[] {
    let pluginNames: string[] = [];
    for (let devices of Object.values(deviceChain)) {
      if (!Array.isArray(devices)) {
        devices = [devices];
      }
      for (const device of devices as any[]) {
        // Is a group
        if (device.Branches) {
          pluginNames = pluginNames.concat(
            this.parseGroupChain(device.Branches),
          );
        }
        if (device.PluginDesc) {
          const pluginDesc = device.PluginDesc;
          if (pluginDesc.AuPluginInfo) {
            pluginNames = pluginNames.concat(
              pluginDesc.AuPluginInfo.Name.Value,
            );
          } else if (pluginDesc.VstPluginInfo) {
            pluginNames = pluginNames.concat(
              pluginDesc.VstPluginInfo.PlugName.Value,
            );
          } else if (pluginDesc.Vst3PluginInfo) {
            pluginNames = pluginNames.concat(
              pluginDesc.Vst3PluginInfo.Name.Value,
            );
          }
        }
      }
    }
    return [...new Set(pluginNames)];
  }

  private parseGroupChain(groupChain: any): string[] {
    let pluginNames: string[] = [];
    for (let group of Object.values(groupChain)) {
      if (!Array.isArray(group)) {
        group = [group];
      }
      for (const device of group as any[]) {
        const deviceChain = device.DeviceChain;
        if (deviceChain.AudioToAudioDeviceChain) {
          pluginNames = pluginNames.concat(
            this.parseDeviceChain(deviceChain.AudioToAudioDeviceChain.Devices),
          );
        }
        if (deviceChain.MidiToAudioDeviceChain) {
          pluginNames = pluginNames.concat(
            this.parseDeviceChain(deviceChain.MidiToAudioDeviceChain.Devices),
          );
        }
      }
    }
    return pluginNames;
  }
}
